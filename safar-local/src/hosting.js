export const HOSTED_DEMO = import.meta.env?.VITE_HOSTED_DEMO === 'true';
export const HOSTED_NOTICE = 'AI model downloads are unavailable in this hosted demo because of hosting file-size limits. Run the full project on localhost to use on-device AI. Bundled phrases, Maps, visitor records and Noor’s trial remain available here.';
export function requireLocalModels(){if(HOSTED_DEMO)throw new Error(HOSTED_NOTICE)}
