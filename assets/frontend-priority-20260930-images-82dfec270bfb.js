const GAMEPLAY_IMAGE_SELECTOR = [
	"figure.gameplay-evidence img",
	"figure.project-runtime-shot img",
	"figure.fc-screen img",
	"figure.ninja-rule-media img",
	"figure.story-figure img",
	"figure.riff-shot img",
	"figure img[src*=\"/assets/contral-review/runtime-\"]",
	"figure img[src*=\"/assets/optimized-20260930/\"]"
].join(",");
const records = new WeakMap();
let lazyObserver = null;
function sourceKey(image) {
	return [
		"src",
		"srcset",
		"sizes"
	].map((attribute) => image.getAttribute(attribute) ?? "").join("\0");
}
function hasSource(image) {
	return Boolean(image.getAttribute("src") || image.getAttribute("srcset"));
}
function getHost(image) {
	return image.closest(".ninja-runtime-shot, figure.gameplay-evidence, figure.project-runtime-shot, figure.fc-screen, figure.ninja-rule-media, figure.story-figure, figure.riff-shot, figure");
}
function stateText(state) {
	if (state === "loading") return "图片加载中";
	if (state === "error") return "图片加载失败";
	return "";
}
function setState(image, record, state) {
	image.dataset.imageState = state;
	record.host.dataset.imageState = state;
	record.status.dataset.imageState = state;
	record.status.textContent = stateText(state);
	if (state === "loading") image.setAttribute("aria-busy", "true");
	else image.removeAttribute("aria-busy");
}
function observeLazyImage(image) {
	if (typeof IntersectionObserver === "undefined") {
		const record = records.get(image);
		if (record) {
			record.started = true;
			setState(image, record, "loading");
		}
		return;
	}
	lazyObserver ??= new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (!entry.isIntersecting && entry.intersectionRatio <= 0) continue;
			const image = entry.target;
			if (!(image instanceof HTMLImageElement)) continue;
			lazyObserver?.unobserve(image);
			const record = records.get(image);
			if (!record || record.started || !hasSource(image)) continue;
			record.started = true;
			setState(image, record, "loading");
			if (image.complete && image.naturalWidth === 0 && typeof image.decode === "function") {
				const expectedSourceKey = record.sourceKey;
				void image.decode().then(() => {
					if (sourceKey(image) === expectedSourceKey) setState(image, record, "loaded");
				}).catch(() => {
					if (sourceKey(image) === expectedSourceKey && image.complete && image.naturalWidth === 0) {
						setState(image, record, "error");
					}
				});
			}
		}
	}, { rootMargin: "320px 0px" });
	lazyObserver.observe(image);
}
function beginCurrentSource(image, record) {
	if (!hasSource(image)) {
		record.started = false;
		setState(image, record, "idle");
		return;
	}
	if (image.complete) {
		if (image.naturalWidth > 0) {
			record.started = true;
			setState(image, record, "loaded");
		} else if (image.loading === "lazy") {
			record.started = false;
			setState(image, record, "idle");
			observeLazyImage(image);
		} else {
			record.started = true;
			setState(image, record, "error");
		}
		return;
	}
	if (image.loading === "lazy") {
		record.started = false;
		setState(image, record, "idle");
		observeLazyImage(image);
		return;
	}
	record.started = true;
	setState(image, record, "loading");
}
function initializeImage(image) {
	if (records.has(image)) return;
	const host = getHost(image);
	if (!host) return;
	host.classList.add(host.tagName === "FIGURE" ? "image-loading-figure" : "image-loading-host");
	const status = document.createElement("span");
	status.className = "image-loading__status";
	status.setAttribute("role", "status");
	status.setAttribute("aria-live", "polite");
	status.setAttribute("aria-atomic", "true");
	host.append(status);
	const record = {
		host,
		status,
		sourceKey: sourceKey(image),
		started: false,
		sourceObserver: new MutationObserver(() => {
			const nextSourceKey = sourceKey(image);
			if (nextSourceKey === record.sourceKey) return;
			record.sourceKey = nextSourceKey;
			lazyObserver?.unobserve(image);
			record.started = false;
			beginCurrentSource(image, record);
		})
	};
	records.set(image, record);
	record.sourceObserver.observe(image, {
		attributes: true,
		attributeFilter: [
			"src",
			"srcset",
			"sizes"
		]
	});
	image.addEventListener("load", () => {
		if (sourceKey(image) !== record.sourceKey) {
			record.sourceKey = sourceKey(image);
			record.started = false;
			beginCurrentSource(image, record);
			return;
		}
		record.started = true;
		setState(image, record, "loaded");
	});
	image.addEventListener("error", () => {
		if (sourceKey(image) !== record.sourceKey) {
			record.sourceKey = sourceKey(image);
			record.started = false;
			beginCurrentSource(image, record);
			return;
		}
		record.started = true;
		setState(image, record, "error");
	});
	beginCurrentSource(image, record);
}
/** Add loading feedback to existing gameplay figures without changing links or image text. */
export function initImageLoading(root = document) {
	root.querySelectorAll(GAMEPLAY_IMAGE_SELECTOR).forEach(initializeImage);
}

initImageLoading();
