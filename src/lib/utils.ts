export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env vars
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set on Vercel deployments
    '';
  
  // On client-side, window.location.origin is the absolute source of truth
  if (!url && typeof window !== 'undefined') {
    url = window.location.origin;
  }
  
  // Fallback to localhost if no other source is found
  url = url || 'http://localhost:3000/';
  
  // Make sure to include `https://` when not localhost and http is missing
  url = url.includes('http') ? url : `https://${url}`;
  
  // Make sure to include a trailing `/`
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  
  return url;
};
