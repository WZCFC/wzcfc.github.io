const toggle = document.querySelector("#game-experience .experience-toggle");
const experienceSection = document.querySelector("#game-experience");
const content = document.querySelector("#experience-content");
if (toggle && experienceSection && content) {
	const staticHeading = experienceSection.querySelector(".experience-heading-static");
	const toggleLabel = toggle.querySelector(".experience-toggle-label");
	const setExpanded = (expanded) => {
		toggle.setAttribute("aria-expanded", String(expanded));
		if (toggleLabel) toggleLabel.textContent = expanded ? "收起游戏经历" : "展开游戏经历";
		content.hidden = !expanded;
	};
	const idForHash = (hash) => {
		if (!hash) return null;
		try {
			return decodeURIComponent(hash.slice(1));
		} catch {
			return null;
		}
	};
	const targetForHash = (hash) => {
		const id = idForHash(hash);
		if (!id) return null;
		const target = document.getElementById(id);
		return target instanceof HTMLElement && content.contains(target) ? target : null;
	};
	const pageTargetForHash = (hash) => targetForHash(hash) ?? (idForHash(hash) === experienceSection.id ? experienceSection : null);
	const revealCurrentHash = () => {
		const target = pageTargetForHash(window.location.hash);
		if (!target) return;
		setExpanded(true);
		requestAnimationFrame(() => requestAnimationFrame(() => {
			if (pageTargetForHash(window.location.hash) === target) {
				target.scrollIntoView({
					block: "start",
					behavior: "instant"
				});
			}
		}));
	};
	setExpanded(toggle.getAttribute("aria-expanded") === "true");
	if (staticHeading) staticHeading.hidden = true;
	toggle.hidden = false;
	toggle.addEventListener("click", () => {
		setExpanded(toggle.getAttribute("aria-expanded") !== "true");
	});
	window.addEventListener("hashchange", revealCurrentHash);
	document.addEventListener("click", (event) => {
		if (!(event.target instanceof Element)) return;
		const link = event.target.closest("a[href]");
		if (!link || !link.hash) return;
		const href = new URL(link.href);
		if (href.origin !== window.location.origin || href.pathname !== window.location.pathname || href.search !== window.location.search) return;
		const target = pageTargetForHash(href.hash);
		if (!target) return;
		setExpanded(true);
		if (href.hash === window.location.hash) revealCurrentHash();
	});
	if (window.location.hash) revealCurrentHash();
}
