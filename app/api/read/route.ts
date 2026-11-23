// The article page's visit counter, at a path content blockers leave alone: they block anything
// named "track", which used to hide the count for readers (and the author) running one.
// POST logs the visit through the analytics handler; GET returns the article's visit count.
export { POST } from '../track/route';
export { GET } from '../views/route';
