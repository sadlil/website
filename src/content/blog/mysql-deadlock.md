+++
date = "2018-04-21T10:30:00"
draft = false
tags = ["software engineering", "database", "mysql", "deadlock"]
title = "How Do We Get Rid of a InnoDB Deadlock"
math = true
summary = """
Last time i heard the word **deadlock** i was in college. I read the definition of deadlock in text books. I was so lucky
or who knows may be careful that i didn't encounter deadlock until now.
"""
+++

Read in [Medium.com](https://medium.com/@sadlil/how-do-we-get-rid-of-a-innodb-deadlock-6829a2114d1a)

Last time i heard the word **deadlock** i was in college. I read the definition of deadlock in text books. I was so lucky
or who knows may be careful that i didn't encounter deadlock until now.

So lets go, remember the old days by remembering the definition again -

> A deadlock is a situation where two different programs or processes depend on
one another for completion, either because both are using the same resources or
because of erroneous cues or other problems.

Here we go again. The good old days, where we just memorizes stuffs and days goes on.
Lets try to do some better understanding, by writing a few lines in code languages that we all understands better.

{{< highlight go >}}
var m1, m2 sync.Mutex

func main() {
	var wg sync.WaitGroup

	wg.Add(1)
	go func() {
		defer wg.Done()

		m1.Lock()
		time.Sleep(time.Second * 2)
		m2.Lock()
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()

		m2.Lock()
		time.Sleep(time.Second * 3)
		m1.Lock()
	}()

	wg.Wait()
}
{{< / highlight >}}

[See in Playground](https://play.golang.org/p/HZzEQiebUdR). Boom here we go, **Deadlock**.


So where did i got deadlock after so long years, in some plain simple MySql upsert.

I recently joined [Grab](https://grab.com).
In grab we work with lots of unicorns. I mean literally huge lot of unicorns. Those unicorns are very keen to do hard work
by collecting their favorite foods **flora**. They are also very keen to know their work log. When and How they did with their
work, If something went missing they become so much angry. So we had to be very careful storing and manipulating those data.

As the number of unicorns are so high, we tries to store those floras by triggering some job time to time.
They are as frequent as possible and those jobs are doing a lot of Batch Upsert in MySql. We were trying to increase our job, to
serves those unicorns better. And suddenly we are getting Deadlocks from MySql. As we were already careful,
and **doing retry on our failed queries**, we find ourselves safe. But our engineering mind wanted to know the reason.
We wanted to know what we could do better to avoid those flunky deadlocks.

### InnoDB Deadlock
We went on the goose chase and found out that  -- it is possible to cause deadlocks in Innodb
on concurrent `insert` or `insert ... on duplicate key update` statements,
without there being any transactions in progress. Deadlocks are possible even when the inserts don't collide on any key.
The reason for getting deadlocks is **Gap Locking**. There are several reasons for [Gap locking](https://dev.mysql.com/doc/refman/5.6/en/innodb-locking.html#innodb-gap-locks),
the most common one is mysql has to deal with preserving a unique key constraint on an index.

The situation presents itself to us this way:
There is a unique key constraint on a column and we are doing an insert. Mysql has to make sure that
the lock it takes is sufficient to prevent another concurrent insert from adding a record with the same key.


[This post](http://thushw.blogspot.sg/2010/11/mysql-deadlocks-with-concurrent-inserts.html) did a fabulous job explaining the
gap lock to me by the following way -
If we want to illustrate the deadlock due to gap lock with some simple query, let us start with a table schema:

{{< highlight mysql >}}
CREATE TABLE unicorns (
   id bigint(10) NOT NULL auto_increment,
   name varchar(255) NOT NULL,
   PRIMARY KEY (id),
   UNIQUE KEY key_name (name)
) ENGINE=InnoDB
{{< / highlight>}}



Let us assume the following rows already exists in the `unicorns` table, and lets look at them at the order of
name index.

{{< highlight go >}}
  | id | name |
  |----|------|
  | 11 | ggg  |
  | 04 | jjj  |
{{< / highlight >}}

Now, lets **imagine** **two concurrent connections** executing the following inserts simultaneously in the following order:

**Connection 1**:<br>
`insert ignore into unicorns values(null, "ppp");`
For this insert to proceed, connection 1 will lock the gap between `"jjj"` and `"ppp"` in the name index.


**Connection 2**:<br>
`insert ignore into unicorns values (null,"iii");`
This will require locking the gap after `"ggg"`, upto `"iii"`. Since the lock from connection 1 does not span this,
it will take the lock.

`insert ignore into unicorns values (null, "mmm");`
This needs to lock the gap after `"jjj"` upto `"mmm"`. Since **connection 1** has a lock between `"jjj"` and `"ppp"`,
effectively spanning the lock **connection 2** is attempting to take, this will block.

**Connection 1**:<br>
`insert ignore into unicorns values (null, "hhh");`
This again requires the gap lock between `"ggg"` and `"hhh"`. This will block as it spans the the
lock `["ggg" to "iii"]` held by **connection 2**.

Thus we have both connections blocked on each other. This is the :boom: :boom: :boom: **deadlock** :boom: :boom: :boom:.

At this state running `SHOW ENGINE INNODB STATUS` will show the recent deadlock with exact parameters and locking information
that will help to debug and understand the issue more robustly.

----


Going forward we discovered this bug report in mysql https://bugs.mysql.com/bug.php?id=52020, and eventually we found this
in mysql change logs in mysql versions `5.6.4, 5.1.61, and 5.5.20` that stats -

{{< highlight text >}}
  Issuing INSERT...ON DUPLICATE KEY statements for InnoDB tables from concurrent threads
  could cause a deadlock, particularly with the INSERT...ON DUPLICATE KEY UPDATE form.
  The problem could also be triggered by issuing multiple INSERT IGNORE statements. The
  fix avoids deadlocks caused by the same row being accessed by more than one transaction.
  Deadlocks could still occur when multiple rows are inserted and updated simultaneously
  by different connection in inconsistent order; those types of deadlocks require the
  standard error handling on the application side, of re-trying the transaction.
  (Bug #11759688, Bug #52020, Bug #12842206)
{{< / highlight >}}

And So we are doomed. So the solution is on application side. Now we need to find out all possible improvements that
we could do in our application side, hence enhancing our engineering capabilities. Lets go find out the solutions.


### Available Solutions:

#### Retry
 The most simplest solution is to retry with some delay for the failed query. In case of a Deadlock like in our example
 connection 1 will get errored, but connection 2 will success afterwards. So retrying the connection 1 query will success eventually.

 > We are already doing retry, as we were careful. So We got saved in this case.

---

#### Shard and/or Normalize the table:
 If we could shard or normalize our unicorn table into multiple database or tables in a way that the gap locking on insert
 could potentially be minimize eventually the occurrence of deadlocks would be decreased.

 > Normalization is not an option for us. First of all we care most about not to do joins on the quires.
 With respect to the size of unicorns table its too costly.
 Shard we can do that. But that's like a long term solution. We can't do immediate sharding at this moment
 and still support the previous data. But eventually we can do that in the future. And if we are going to
 start other tables we should obviously keep that in mind.

---

#### Chose your index carefully
 If you are using index based on multiple keys you should chose those columns and index order carefully.
 The columns that varies frequently, please use that as less possible, or as the last in the order index.
 ie `UNIQUE KEY key_name (name, updated_at)` is much better index than `UNIQUE KEY key_name (updated_at, name)`
 and reduces the chance of deadlock.


#### Reduce Batch Size
 Keep the batch size small and short. So it will took less time execute and hence make them less prone to collision.

 > If we reduce our batch size the deadlock may occur less, But it will increase our query count.
 And we had to make peace with the time that increased due to increased query count. Now which one is better?
 Increased time due to retry after deadlock or More query to run? We need to find a sweet spot that we can live
 peacefully with.

---

#### Order Query
 Ordering the indexed values in query for every connection reduces the probabilities of higher gap locks. In our example table
 above, we could actually avoid the deadlock by inserting the values in the order of `name` index.

 Let me explain in a bit more details for this as i have a comment to elaborate this phrase. If we go back to our example with unicorns table and the queries with two connection we saw that queries in the following order<br>
 1. Connection 1 to insert "ppp" and requiring gap lock between "jjj" to "ppp";<br>
 2. Connection 2 to insert "iii" and requiring gap lock between "ggg" to "iii";
 and trying to insert "mmm" and this requires lock after "jjj" upto "mmm".<br>
 3. Connection 1 to insert "hhh" and that required gap lock between "ggg" and "hhh";<br>
 But this is already held by connection 2. And connection 2 can not complete its query because it is waiting on connection 1 to release the lock for "ppp". And gets the dead lock.
 But if we insert those quires in order of "name" that is actually our index, and tries to executes those sorted queries  - as connection 1 tries to insert "hhh" first before trying to insert "ppp" -  this reduces chances of deadlock by reducing chances for minimised gap locks.

 > Now that's what we can defiantly do. Sorting increases the full process execution time a bit, but with
 some good sorting algorithms available that is not that much.

---

#### Convert `INSERT ON DUPLICATE KEY UPDATE` into `SELECT then INSERT or UPDATE`
 Converting the `INSERT ON DUPLICATE KEY UPDATE` query into a `SELECT then INSERT or UPDATE` can help to lower down
 deadlocks.

---

#### Use MySIAM storage engine
 There is another option to avoid deadlock to use a different engine entirely. MySIAM Engine has a mechanism
 to avoid a deadlock scenario. Instead of row level locking MySIAM uses full table level locking. And I
 MySIAM does not implement any transaction.

 > We are not inserted to switch over to another new storage engine. Probably you too.


### Solution:
 After our findings we decided to go with two immediate approach for our unicorn table.

  - We are already retrying and will continue doing this,
  - Reduce batch size for query,
  - Order by index columns before query

  That gave us significant improvement on the situation. May be in future we will also try to shard
  our unicorns tables, we kept the options open.

---

Willing to work with challenges like this? Grab is Hiring. Check out [grab.carrers](https://grab.careers/team-engineering/?tm=Engineering).
Or drop me an email.

---


### References:
 - MySql Bug - https://bugs.mysql.com/bug.php?id=52020
 - InnoDB Deadlock - https://dev.mysql.com/doc/refman/5.6/en/innodb-locking.html#innodb-gap-locks
 - MySql InnoDB Deadlock - http://thushw.blogspot.sg/2010/11/mysql-deadlocks-with-concurrent-inserts.html
 - MySql Forum suggestion to avoid deadlock - https://forums.mysql.com/read.php?22,386646,386998#msg-386998
 - InnoDB Deadlock example https://dev.mysql.com/doc/refman/5.7/en/innodb-deadlock-example.html
 - Prevent Deadlock - https://www.xaprb.com/blog/2006/08/03/a-little-known-way-to-cause-a-database-deadlock/
 - MySql Doc to avoid deadlocks - https://dev.mysql.com/doc/refman/5.6/en/innodb-deadlocks-handling.html
 - MySIAM storage Engine - https://dev.mysql.com/doc/refman/5.7/en/myisam-storage-engine.html
