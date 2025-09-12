export const getRedirectURL = (): string => {
  const isDev = import.meta.env.DEV;
  const baseUrl = isDev ? 'http://localhost:8080' : window.location.origin;
  return baseUrl;
};

export const getAuthRedirectURL = (path: string = '/'): string => {
  return `${getRedirectURL()}${path}`;
};