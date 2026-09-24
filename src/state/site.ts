import { createSiteAddresses } from 'react-cheminfo/core';

import { SITE_ID } from '../routes.ts';

/**
 * Where this deployment is mounted and what its addresses are. The mount is
 * read off the `<base>` the page carries, not off the build: one image serves
 * the site's own host and a path of a shared one alike.
 */
export const ADDRESSES = createSiteAddresses(SITE_ID);
