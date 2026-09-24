const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const year = document.querySelector("#year");

if (year) {
	year.textContent = new Date().getFullYear();
}

menuToggle?.addEventListener("click", () => {
	const isOpen = siteNav.classList.toggle("is-open");
	menuToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.querySelectorAll("a").forEach((link) => {
	link.addEventListener("click", () => {
		siteNav.classList.remove("is-open");
		menuToggle?.setAttribute("aria-expanded", "false");
	});
});

const revealObserver = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		if (entry.isIntersecting) {
			entry.target.classList.add("is-visible");
			revealObserver.unobserve(entry.target);
		}
	});
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

contactForm?.addEventListener("submit", (event) => {
	event.preventDefault();
	const formData = new FormData(contactForm);
	const name = formData.get("name");
	formStatus.textContent = `Thanks, ${name}. Your message is ready to send.`;
	contactForm.reset();
});
