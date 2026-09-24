/**
 * The application shell: the family's header, the tools beside the brand, the
 * routed page, and the footer that links every sister site.
 *
 * The page on screen is the address — `useTabRoute` reads it and re-renders on
 * every move — so there is no page state to keep in step with it. A link
 * written for a course frames a tool with `?embed`, and the chrome is then not
 * rendered at all: what a host page frames already carries its own navigation.
 */

import { useSignals } from '@preact/signals-react/runtime';
import type { ReactElement, ReactNode } from 'react';
import { Suspense, lazy, useEffect, useState } from 'react';
import type { NavItem } from 'react-cheminfo/ui';
import {
  CiteButton,
  EcosystemButton,
  GlossaryProvider,
  HiddenPartsProvider,
  NavLink,
  ShareButton,
  ShareDialog,
  SiteFooter,
  SiteHeader,
  SiteMark,
  SiteTheme,
  useCompactHeader,
  useTabRoute,
} from 'react-cheminfo/ui';

import { ABOUT } from './about.ts';
import { GLOSSARY } from './data/glossary.ts';
import { About } from './pages/About.tsx';
import { Cheatsheet } from './pages/Cheatsheet.tsx';
import { Electrons } from './pages/Electrons.tsx';
import { Isotopes } from './pages/Isotopes.tsx';
import { Neutrons } from './pages/Neutrons.tsx';
import { Oxidation } from './pages/Oxidation.tsx';
import type { TabId } from './routes.ts';
import {
  HOME_TAB,
  REPOSITORY,
  ROUTES,
  SITE_ID,
  SITE_NAME,
  routeForTab,
} from './routes.ts';
import { state } from './state/index.ts';
import { pinnedSearch, startPreferenceSync } from './state/preferences.ts';
import { navigate, router, startDocumentTitles } from './state/router.ts';
import { SHARE_PRESETS, SHARE_VOCABULARY } from './state/shareConfig.ts';

// OpenChemLib and its editor are several megabytes, and only this page needs
// them.
const Lewis = lazy(async () => {
  const module = await import('./pages/Lewis.tsx');
  return { default: module.Lewis };
});

/** About is a utility, so it is not one of the pages listed beside the brand. */
const ABOUT_TAB: TabId = 'about';

/**
 * The whole application: chrome, and the one page the address names.
 * @returns The shell.
 */
export function App(): ReactElement {
  useSignals();
  const { tab } = useTabRoute(router);
  const share = state.view.share.value;
  const [isSharing, setIsSharing] = useState(false);
  const compact = useCompactHeader();

  useEffect(() => {
    const stopTitles = startDocumentTitles();
    const stopPreferences = startPreferenceSync();
    return () => {
      stopTitles();
      stopPreferences();
    };
  }, []);

  const pageName = `${routeForTab(tab).label} — ${SITE_NAME}`;

  return (
    <GlossaryProvider glossary={GLOSSARY}>
      <HiddenPartsProvider hidden={share.hidden}>
        <SiteTheme siteId={SITE_ID} />

        <div className="app-screen">
          <SiteHeader
            siteId={SITE_ID}
            embedded={share.embed}
            activeId={tab}
            homeHref={router.format({ tab: HOME_TAB })}
            onHome={() => {
              navigate(HOME_TAB);
            }}
            nav={share.hidden.includes('tabs') ? [] : navItems()}
            actions={
              <>
                {/* About leads the utilities on every site of the family, and
                    is a real address rather than a dialog: a page is indexed,
                    linkable and printable. */}
                <NavLink
                  item={{
                    id: ABOUT_TAB,
                    label: 'About',
                    icon: <SiteMark siteId={SITE_ID} size={14} />,
                    href: router.format({ tab: ABOUT_TAB }),
                    title: `What ${SITE_NAME} is, and how to cite it`,
                    onSelect: () => {
                      navigate(ABOUT_TAB);
                    },
                  }}
                  active={tab === ABOUT_TAB}
                />
                <CiteButton works={ABOUT.cite ?? []} compact={compact} />
                <EcosystemButton currentSiteId={SITE_ID} compact={compact} />
                <ShareButton
                  compact={compact}
                  onClick={() => {
                    setIsSharing(true);
                  }}
                />
              </>
            }
          />

          <main
            className={
              share.embed ? 'app-shell app-shell--embedded' : 'app-shell'
            }
            data-testid={`page-${tab}`}
          >
            <PageBody tab={tab} />
          </main>
        </div>

        <SiteFooter
          siteId={SITE_ID}
          embedded={share.embed}
          heading="The rest of the cheminfo family"
        >
          <p className="app-footer-note">
            Open source, MIT licensed —{' '}
            <a href={REPOSITORY} target="_blank" rel="noreferrer noopener">
              the sources of this site
            </a>
            . Every series of questions is a link you can hand out or frame in a
            course page.
          </p>
        </SiteFooter>

        <ShareDialog
          isOpen={isSharing}
          onClose={() => {
            setIsSharing(false);
          }}
          vocabulary={SHARE_VOCABULARY}
          presets={SHARE_PRESETS}
          title={pageName}
          frameTitle={pageName}
          search={isSharing ? pinnedSearch() : undefined}
        />
      </HiddenPartsProvider>
    </GlossaryProvider>
  );
}

/**
 * The pages, in the order the bar lists them. Each is a real address as well
 * as an action, so a crawler walks the site and a middle click opens the page
 * in a tab of its own.
 * @returns One entry per page, About excepted.
 */
function navItems(): NavItem[] {
  const items: NavItem[] = [];
  for (const route of ROUTES) {
    if (route.tab === ABOUT_TAB) continue;
    items.push({
      id: route.tab,
      label: route.label,
      href: router.format({ tab: route.tab }),
      onSelect: () => {
        navigate(route.tab);
      },
    });
  }
  return items;
}

function PageBody(props: { tab: TabId }): ReactNode {
  const { tab } = props;
  if (tab === 'neutrons') return <Neutrons />;
  if (tab === 'isotopes') return <Isotopes />;
  if (tab === 'lewis') {
    return (
      <Suspense
        fallback={<p className="page__lead">Loading the structure editor…</p>}
      >
        <Lewis />
      </Suspense>
    );
  }
  if (tab === 'oxidation') return <Oxidation />;
  if (tab === 'cheatsheet') return <Cheatsheet />;
  if (tab === ABOUT_TAB) return <About />;
  return <Electrons />;
}
