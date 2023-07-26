# Indexes

This document was created to document all future indexes we use when deploying Coral. It is not meant to be a comprehensive list of indexes because some of our indexes are auto-generated by our legacy migration steps. Since we no longer do migrations, it is necessary to write down the indexes we need when deploying Coral.

The goal of this document is to date-mark the indexes you add to support the changes you make to the code-base. So if when writing your code, you remove `index A` and create `index B`, add a date using `## YYYY-MM-dd` as a header, and include the operations surrounded by tilde code tags for removing `index A` and adding `index B` so that devs and SRE can know what indexes are needed for each release. It also considered nice to include a bullet point description under your entry defining why it was created and what it does.

If you are releasing, you can use this readme to check all the indexes prior to the release you are deploying and have a good idea of what indexes you might need to deploy to Mongo along with your release of a new Coral Docker image to kubernetes.

## 2023-03-28

```
db.archivedCommentActions.createIndex({ tenantID: 1, storyID: 1 });
```

- This is used to speed up when the redis cache asks for the `archivedCommentActions` associated with a specific story.
  - This is common when an archived story is loaded into the redis cache.

## 2022-03-07

```
db.archivedComments.createIndex({ authorID: 1, tenantID: 1, createdAt: 1 });
```

- This is used to speed up downloading a user's comments. There are indexes existing for the regular `comments`, but this addresses this for the `archivedComments`.

## 2022-01-18

```
db.seenComments.createIndex({ tenantID: 1, storyID: 1, userID: 1 });
db.seenComments.createIndex({ lastSeenAt: 1 }, { expireAfterSeconds: 604800 });
```

  - These indexes manage the `seenComments` collection to provide persistence of a user's seen comments from device to device.
  - This is a special set of indexes because the second index is a TTL index.
    - It specifies when old `seenComments` documents will "expire" and be gracefully deleted.
    - The above `expireAfterSeconds` default of `604800` is 7 days.

## 2022-01-17

```
db.commentActions.createIndex({ tenantID: 1, actionType: 1, createdAt: 1 }, { partialFilterExpression: { actionType: "FLAG" } });
```
  - This index speeds up the pagination of the `For Review` queue by partial filtering the flags in the comment actions to make them easier to query.

## 2021-12-17

```
db.sites.createIndex({ tenantID: 1, "$**": "text", createdAt: -1 });
```
  - This index creates a text search on sites so that when you use a text-filter base on site name, Mongo knows how to resolve your search query.

## Existing Indexes prior to start of `INDEXES.md`

### commentActions:

#### uniqueness constraint indexes:

```
db.commentActions.createIndex({ _id: 1 });
db.commentActions.createIndex({ tenantID: 1, id: 1 });
```

#### Other indexes:
```
db.commentActions.createIndex({ tenantID: 1, actionType: 1, commentID: 1, userID: 1 });
db.commentActions.createIndex({ tenantID: 1, actionType: 1, commentID: 1, createdAt: -1 });
db.commentActions.createIndex({ commentID: 1, tenantID: 1, createdAt: 1 });
db.commentActions.createIndex({ tenantID:1, userID:1, commentID:1 });
db.commentActions.createIndex({ tenantID: 1, siteID: 1 });
```

### commentModerationActions:

#### Uniqueness constraint indexes:

```
db.commentModerationActions.createIndex({ _id: 1 });
db.commentModerationActions.createIndex({ tenantID: 1, id: 1 });
```

#### Other indexes:
```
db.commentModerationActions.createIndex({ tenantID: 1, commentID: 1, createdAt: -1 });
db.commentModerationActions.createIndex({ moderatorID: 1, tenantID: 1, createdAt: -1 });
```

### comments

#### Uniqueness constraint indexes:

```
db.comments.createIndex({ _id: 1 });
db.comments.createIndex({ tenantID: 1, id: 1 });
```

#### Other indexes:
```
db.comments.createIndex({ authorID: 1, tenantID: 1, createdAt: 1 });
db.comments.createIndex({ siteID: 1, tenantID: 1, createdAt: 1 });
db.comments.createIndex({ siteID: 1, tenantID: 1, status: 1, createdAt: 1 });
db.comments.createIndex({ status: 1, tenantID: 1, createdAt: 1 });
db.comments.createIndex({ storyID: 1,parentID: 1,tenantID: 1,status: 1,'actionCounts.REACTION': -1,createdAt: -1 });
db.comments.createIndex({ storyID: 1, tenantID: 1, createdAt: 1 });
db.comments.createIndex({ storyID: 1,tenantID: 1,status: 1,childCount: -1,createdAt: -1 });
db.comments.createIndex({ storyID: 1, tenantID: 1, 'tags.type': 1, createdAt: 1 });
db.comments.createIndex({ tenantID: 1, storyID: 1, 'tags.type': 1, status: 1 }, { partialFilterExpression: { 'tags.type': { '$exists': true } } });
db.comments.createIndex({ tenantID: 1,storyID: 1,parentID: 1,status: 1,childCount: -1,createdAt: -1 });
db.comments.createIndex({ tenantID: 1, status: 1, createdAt: 1 }, { partialFilterExpression: { 'actionCounts.FLAG': { '$gt': 0 } } });
```

```
db.comments.createIndex({ storyID: 1,tenantID: 1,'tags.type': 1,'actionCounts.REACTION': -1,createdAt: -1 });
```
  - NOTE: is this a partial filter index?

```
db.comments.createIndex({ storyID: 1, parentID: 1, tenantID: 1, status: 1, createdAt: 1 });
```
  - NOTE: want to keep null parentIDs in index because queries are matching on null