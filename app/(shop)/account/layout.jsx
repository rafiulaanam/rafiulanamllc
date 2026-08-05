// Account pages are personal to the logged-in user — keep them out of search results.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }) {
  return children;
}
