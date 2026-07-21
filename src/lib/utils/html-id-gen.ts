let n = Date.now();

/** Generate sequential unique ids for HTML elements within the same app. */
export default function getSeqId(): string {
	return 'su-' + (++n).toString(36);
}
