-- Votes unabhängig machen: ein User kann sowohl 👍 als auch 👎 geben.
-- Unique-Index wird um 'value' erweitert → (user, post, value) statt (user, post)

DROP INDEX IF EXISTS forum_votes_post_unique;
DROP INDEX IF EXISTS forum_votes_reply_unique;

CREATE UNIQUE INDEX forum_votes_post_unique
  ON forum_votes(user_id, post_id, value) WHERE post_id IS NOT NULL;

CREATE UNIQUE INDEX forum_votes_reply_unique
  ON forum_votes(user_id, reply_id, value) WHERE reply_id IS NOT NULL;
