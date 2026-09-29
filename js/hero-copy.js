(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const slidesByPage = [
        {
            root: ".about-hero-copy",
            imageTarget: ".about-hero-image img",
            imageMode: "element",
            label: ".eyebrow",
            title: "h1",
            description: ".about-lead",
            slides: [
                {
                    label: "OUR STORY",
                    title: "Beauty that feels<br><em>like you.</em>",
                    description: "At Sunshine's Luxury Hair, we believe the right hair can do more than complete a look. It can help you show up with confidence, express your style, and feel beautifully yourself.",
                    image: "assets/images/hero.jpg"
                },
                {
                    label: "CONFIDENCE, YOUR WAY",
                    title: "Your look.<br><em>Your confidence.</em>",
                    description: "Find styles that make you feel radiant, comfortable, and completely yourself in every moment.",
                    image: "assets/images/home/IMG-20260715-WA0007.jpg"
                },
                {
                    label: "MADE FOR YOUR MOMENTS",
                    title: "Feel beautiful.<br><em>Feel like you.</em>",
                    description: "From everyday elegance to a statement style, discover luxury hair that fits the way you want to feel.",
                    image: "assets/images/hero.jpg"
                }
            ]
        },
        {
            root: ".contact-intro",
            label: ".contact-eyebrow",
            title: "h1",
            description: ":scope > p:last-child",
            slides: [
                {
                    label: "WE'RE HERE FOR YOU",
                    title: "Let's talk about<br><em>your next look.</em>",
                    description: "Have a question about a style, an order, or finding the right look? Send us a message and our team will get back to you."
                },
                {
                    label: "HERE TO HELP",
                    title: "We're listening.<br><em>Let's connect.</em>",
                    description: "Tell us what you are looking for and our team will help with styles, orders, and finding your next look."
                },
                {
                    label: "YOUR QUESTIONS MATTER",
                    title: "A little help<br><em>goes a long way.</em>",
                    description: "Reach out whenever you need help choosing a style or have a question about your order."
                }
            ]
        },
        {
            root: ".cart-page-header",
            label: ".section-label",
            title: "h1",
            description: "p:last-child",
            slides: [
                {
                    label: "SUNSHINE'S LUXURY HAIR",
                    title: "Your Cart",
                    description: "Review your selected pieces before checkout."
                },
                {
                    label: "YOUR PICKS, ALL TOGETHER",
                    title: "Your Selection",
                    description: "Take a moment to check the styles you have chosen."
                },
                {
                    label: "ALMOST YOURS",
                    title: "Ready for Checkout?",
                    description: "Your favorite pieces are waiting. Review your selection before continuing."
                }
            ]
        },
        {
            root: ".checkout-page-header",
            label: ".section-label",
            title: "h1",
            description: "p:last-child",
            slides: [
                {
                    label: "SUNSHINE'S LUXURY HAIR",
                    title: "Checkout",
                    description: "Complete your details and continue to WhatsApp to place your order."
                },
                {
                    label: "A FEW DETAILS TO GO",
                    title: "Almost There",
                    description: "Add your delivery information and we will help complete your order on WhatsApp."
                },
                {
                    label: "YOUR ORDER, YOUR WAY",
                    title: "Let's Complete It",
                    description: "Share your contact and delivery details, then confirm your order with our team."
                }
            ]
        }
    ];

    const fadeDuration = 350;
    const cycleDuration = 6000;
    const generatedHeroCopy = [
        {
            label: "SUNSHINE'S LUXURY HAIR",
            title: "BE BOLD.<br>BE BEAUTIFUL.<br><span>BE YOU.</span>",
            description: "Discover a look that feels unmistakably yours and brings your confidence into every room."
        },
        {
            label: "CONFIDENCE IN EVERY STRAND",
            title: "YOUR BEAUTY.<br>YOUR STYLE.<br><span>YOUR MOMENT.</span>",
            description: "Celebrate your own kind of beauty with a style that feels effortless, polished, and personal."
        },
        {
            label: "MADE FOR YOUR NEXT LOOK",
            title: "A FRESH LOOK.<br>A NEW FEELING.<br><span>ALL YOU.</span>",
            description: "Step into something beautiful and make every day feel like the right moment to shine."
        },
        {
            label: "LUXURY THAT FEELS LIKE YOU",
            title: "MAKE EVERY<br>ENTRANCE<br><span>YOURS.</span>",
            description: "Bring your vision to life with a look that is graceful, confident, and entirely your own."
        },
        {
            label: "BEAUTY WITHOUT COMPROMISE",
            title: "OWN YOUR<br>EVERYDAY<br><span>GLOW.</span>",
            description: "Feel ready for every plan, every occasion, and every beautiful moment in between."
        },
        {
            label: "YOUR STYLE, YOUR WAY",
            title: "LET YOUR<br>CONFIDENCE<br><span>SHINE.</span>",
            description: "Choose the feeling you want to carry and let your personal style do the talking."
        },
        {
            label: "A LITTLE MORE YOU",
            title: "STEP INTO<br>YOUR KIND OF<br><span>BEAUTIFUL.</span>",
            description: "Make space for self-expression with a look that celebrates everything that makes you, you."
        },
        {
            label: "SUNSHINE'S LUXURY HAIR",
            title: "FEEL BEAUTIFUL.<br>FEEL CONFIDENT.<br><span>FEEL YOU.</span>",
            description: "Find your moment, embrace your style, and let your confidence shine from the inside out."
        }
    ];
    const startProductHero = (products, config) => {
        const root = document.querySelector(config.root);
        const imageTarget = document.querySelector(config.imageTarget);
        if (!root || !imageTarget) return;

        const imageEntries = [];
        const seenImages = new Set();
        products.forEach(product => {
            const productImages = [
                product.mainImage,
                product.image,
                ...(Array.isArray(product.images) ? product.images : [])
            ];
            productImages.forEach(image => {
                if (typeof image !== "string" || !image.trim() || seenImages.has(image.trim())) return;
                seenImages.add(image.trim());
                imageEntries.push({
                    image: image.trim()
                });
            });
        });

        if (!imageEntries.length) return;
        if (imageEntries.length < 8) {
            console.info(`${config.productSource} hero has ${imageEntries.length} unique product images; add ${8 - imageEntries.length} more to fill all eight slides.`);
        }

        const slides = imageEntries.slice(0, 8).map((entry, index) => ({
            ...entry,
            ...generatedHeroCopy[index]
        }));
        const label = root.querySelector(config.label);
        const title = root.querySelector(config.title);
        const description = root.querySelector(config.description);
        if (!label || !title || !description) return;

        const applySlide = (index, animate = false) => {
            const slide = slides[index];
            label.textContent = slide.label;
            title.innerHTML = slide.title;
            description.textContent = slide.description;
            const imageUrl = new URL(slide.image, document.baseURI).href;
            imageTarget.style.setProperty("--hero-slide-image", `url("${imageUrl}")`);
            imageTarget.classList.add("hero-products-ready");
            imageTarget.classList.remove("hero-effect-slide", "hero-effect-pop", "hero-effect-fade", "hero-effect-flip", "hero-effect-active");
            root.classList.remove("hero-effect-slide", "hero-effect-pop", "hero-effect-fade", "hero-effect-flip", "hero-effect-active");
            if (animate) {
                const effects = ["slide", "slide", "pop", "pop", "fade", "fade", "flip", "flip"];
                const effectClass = `hero-effect-${effects[index % effects.length]}`;
                imageTarget.classList.add(effectClass);
                root.classList.add(effectClass);
                requestAnimationFrame(() => {
                    imageTarget.classList.add("hero-effect-active");
                    root.classList.add("hero-effect-active");
                });
            }
        };

        let activeSlide = 0;
        applySlide(activeSlide);

        if (root.dataset.productCarouselStarted === "true") return;
        root.dataset.productCarouselStarted = "true";
        window.setInterval(() => {
            if (document.visibilityState !== "visible" || root.matches(":hover") || root.contains(document.activeElement)) return;
            [label, title, description].forEach(element => element.classList.add("hero-copy-fading"));
            imageTarget.classList.add("hero-image-fading");
            window.setTimeout(() => {
                activeSlide = (activeSlide + 1) % slides.length;
                applySlide(activeSlide, true);
                requestAnimationFrame(() => {
                    [label, title, description].forEach(element => element.classList.remove("hero-copy-fading"));
                    imageTarget.classList.remove("hero-image-fading");
                });
            }, fadeDuration);
        }, cycleDuration);
    };

    window.addEventListener("sunshine-products-loaded", event => {
        startProductHero(event.detail?.products || [], {
            root: ".hero-section",
            imageTarget: ".hero-section",
            label: ".hero-label",
            title: ".hero-title",
            description: ".hero-description",
            defaultLabel: "Featured collection",
            productSource: "featured"
        });
    });

    window.addEventListener("sunshine-shop-products-loaded", event => {
        startProductHero(event.detail?.products || [], {
            root: ".shop-hero-copy",
            imageTarget: ".shop-hero",
            label: ".section-label",
            title: "h1",
            description: "p:last-of-type",
            defaultLabel: "Shop collection",
            productSource: "shop"
        });
    });

    slidesByPage.forEach(config => {
        const root = document.querySelector(config.root);
        const label = root?.querySelector(config.label);
        const title = root?.querySelector(config.title);
        const description = root?.querySelector(config.description);
        const imageTarget = config.imageTarget ? document.querySelector(config.imageTarget) : null;
        if (!root || !label || !title || !description) return;

        let activeSlide = 0;
        window.setInterval(() => {
            if (document.visibilityState !== "visible" || root.matches(":hover") || root.contains(document.activeElement)) return;

            [label, title, description].forEach(element => element.classList.add("hero-copy-fading"));
            imageTarget?.classList.add("hero-image-fading");
            window.setTimeout(() => {
                activeSlide = (activeSlide + 1) % config.slides.length;
                const slide = config.slides[activeSlide];
                label.textContent = slide.label;
                title.innerHTML = slide.title;
                description.textContent = slide.description;
                if (imageTarget && slide.image) {
                    if (config.imageMode === "element") {
                        imageTarget.src = slide.image;
                    } else {
                        const imageUrl = new URL(slide.image, document.baseURI).href;
                        imageTarget.style.setProperty("--hero-slide-image", `url("${imageUrl}")`);
                    }
                }
                requestAnimationFrame(() => {
                    [label, title, description].forEach(element => element.classList.remove("hero-copy-fading"));
                    imageTarget?.classList.remove("hero-image-fading");
                });
            }, fadeDuration);
        }, cycleDuration);
    });
})();
