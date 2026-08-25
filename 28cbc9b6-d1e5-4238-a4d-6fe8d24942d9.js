document.addEventListener("DOMContentLoaded", () => {

    const slides = Array.from(document.querySelectorAll(".slide"));
    const prevButton = document.getElementById("prev");
    const nextButton = document.getElementById("next");
    const currentCounter = document.getElementById("current");
    const progressBar = document.getElementById("progressBar");

    const totalSlides = slides.length;

    let currentSlide = 0;


    /* =====================================================
       ATUALIZAR SLIDE
    ====================================================== */

    function updateSlide(index, updateHistory = true) {

        if (index < 0) {
            index = totalSlides - 1;
        }

        if (index >= totalSlides) {
            index = 0;
        }

        currentSlide = index;


        /* Remove o slide ativo dos demais */

        slides.forEach((slide, i) => {

            slide.classList.toggle(
                "active",
                i === currentSlide
            );

        });


        /* =================================================
           CONTADOR
        ================================================== */

        if (currentCounter) {

            currentCounter.textContent =
                String(currentSlide + 1).padStart(2, "0");

        }


        /* =================================================
           BARRA DE PROGRESSO
        ================================================== */

        if (progressBar) {

            const progress =
                ((currentSlide + 1) / totalSlides) * 100;

            progressBar.style.width =
                `${progress}%`;

        }


        /* =================================================
           HISTÓRICO DO NAVEGADOR
        ================================================== */

        if (updateHistory) {

            const newUrl =
                `${window.location.pathname}#slide-${currentSlide + 1}`;

            history.pushState(
                {
                    slide: currentSlide + 1
                },
                "",
                newUrl
            );

        }


        /* =================================================
           ACESSIBILIDADE
        ================================================== */

        const activeSlide =
            slides[currentSlide];

        if (activeSlide) {

            activeSlide.setAttribute(
                "aria-hidden",
                "false"
            );

            slides.forEach((slide, i) => {

                if (i !== currentSlide) {

                    slide.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }

            });

        }

    }


    /* =====================================================
       PRÓXIMO SLIDE
    ====================================================== */

    function nextSlide() {

        updateSlide(currentSlide + 1);

    }


    /* =====================================================
       SLIDE ANTERIOR
    ====================================================== */

    function previousSlide() {

        updateSlide(currentSlide - 1);

    }


    /* =====================================================
       BOTÃO PRÓXIMO
    ====================================================== */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            nextSlide
        );

    }


    /* =====================================================
       BOTÃO ANTERIOR
    ====================================================== */

    if (prevButton) {

        prevButton.addEventListener(
            "click",
            previousSlide
        );

    }


    /* =====================================================
       TECLADO
    ====================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            switch (event.key) {

                case "ArrowRight":
                case "ArrowDown":
                case " ":

                    event.preventDefault();

                    nextSlide();

                    break;


                case "ArrowLeft":
                case "ArrowUp":

                    event.preventDefault();

                    previousSlide();

                    break;


                case "Home":

                    event.preventDefault();

                    updateSlide(0);

                    break;


                case "End":

                    event.preventDefault();

                    updateSlide(totalSlides - 1);

                    break;

            }

        }
    );


    /* =====================================================
       CLIQUE NAS LATERAIS DA TELA
       - lado direito = próximo
       - lado esquerdo = anterior
    ====================================================== */

    document.addEventListener(
        "click",
        (event) => {

            const target =
                event.target;

            /*
             * Não interfere nos botões,
             * links ou elementos interativos.
             */

            if (
                target.closest("button") ||
                target.closest("a") ||
                target.closest("input") ||
                target.closest("textarea") ||
                target.closest("select")
            ) {

                return;

            }


            const screenWidth =
                window.innerWidth;

            const clickX =
                event.clientX;


            /*
             * Área lateral esquerda
             */

            if (clickX < screenWidth * 0.18) {

                previousSlide();

            }


            /*
             * Área lateral direita
             */

            else if (
                clickX > screenWidth * 0.82
            ) {

                nextSlide();

            }

        }
    );


    /* =====================================================
       TOUCH / CELULAR
    ====================================================== */

    let touchStartX = 0;
    let touchEndX = 0;


    document.addEventListener(
        "touchstart",
        (event) => {

            touchStartX =
                event.changedTouches[0].screenX;

        },
        {
            passive: true
        }
    );


    document.addEventListener(
        "touchend",
        (event) => {

            touchEndX =
                event.changedTouches[0].screenX;

            handleSwipe();

        },
        {
            passive: true
        }
    );


    function handleSwipe() {

        const distance =
            touchEndX - touchStartX;


        /*
         * Evita mudar de slide por
         * pequenos movimentos.
         */

        if (Math.abs(distance) < 50) {

            return;

        }


        if (distance < 0) {

            nextSlide();

        } else {

            previousSlide();

        }

    }


    /* =====================================================
       HISTÓRICO DO NAVEGADOR
    ====================================================== */

    window.addEventListener(
        "popstate",
        () => {

            const hash =
                window.location.hash;


            const match =
                hash.match(/slide-(\d+)/);


            if (match) {

                const requestedSlide =
                    parseInt(match[1], 10) - 1;


                if (
                    requestedSlide >= 0 &&
                    requestedSlide < totalSlides
                ) {

                    updateSlide(
                        requestedSlide,
                        false
                    );

                }

            }

        }
    );


    /* =====================================================
       ABRIR DIRETAMENTE EM UM SLIDE
       Exemplo:
       index.html#slide-11
    ====================================================== */

    function loadInitialSlide() {

        const hash =
            window.location.hash;


        const match =
            hash.match(/slide-(\d+)/);


        if (match) {

            const requestedSlide =
                parseInt(match[1], 10) - 1;


            if (
                requestedSlide >= 0 &&
                requestedSlide < totalSlides
            ) {

                updateSlide(
                    requestedSlide,
                    false
                );

                return;

            }

        }


        updateSlide(
            0,
            false
        );

    }


    /* =====================================================
       MODO DE APRESENTAÇÃO
    ====================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            /*
             * F11 continua funcionando
             * normalmente no navegador.
             */

            if (event.key === "Escape") {

                document.body.classList.remove(
                    "presentation-mode"
                );

            }

        }
    );


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    loadInitialSlide();


    /* =====================================================
       REDIMENSIONAMENTO DA JANELA
    ====================================================== */

    window.addEventListener(
        "resize",
        () => {

            /*
             * Mantém o slide atual
             * corretamente posicionado.
             */

            updateSlide(
                currentSlide,
                false
            );

        }
    );

});