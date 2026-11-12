// Datos del catálogo incrustados (sitio estático, sin backend)
const CATALOGO_DATA = {"catalogo":{"id":2,"nombre":"Plateria","descripcion":"villa de torres"},"categorias":[{"id":4,"nombre":"Anillos categoria","descripcion":"","img_url":"img/anillo.jpg","productos":[{"id":4,"nombre":"Anillos de opalo","precio":250.0,"descripcion":"Anillo de piedra natural","img_url":"img/il_794xN.1583980976_o81o.jpg"}]},{"id":5,"nombre":"Cadenas","descripcion":"","img_url":"img/cadena.jpg","productos":[{"id":5,"nombre":"Cadena de espiga","precio":500.0,"descripcion":"Hecha a mano","img_url":"img/nativosjewelryventas-joyeria-default-title-cadena-espiga-plata-quemada-950-para-hombre-3mm-36377466437888_1280x.png"}]},{"id":6,"nombre":"Dijes","descripcion":"","img_url":"img/dije.jpeg","productos":[{"id":6,"nombre":"Dijes de opalo","precio":340.0,"descripcion":"","img_url":"img/D38.jpg"}]}]};

document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.getElementById("product-section-wrapper");
    const grid = document.getElementById("product-grid");
    const categoryGrid = document.getElementById("category-grid");
    const filtersContainer = document.getElementById("filters-container");
    const btnAll = document.querySelector(".filter-all");

    // Elementos de Paginación Numerada
    const paginationContainer = document.getElementById("pagination-container");
    const pgPrev = document.getElementById("pg-prev");
    const pgNext = document.getElementById("pg-next");
    const pgNumbers = document.getElementById("pg-numbers");

    // Elementos del Modal Bottom Sheet
    const modal = document.getElementById("product-modal");
    const overlay = document.getElementById("modal-overlay");
    const closeBtn = document.getElementById("modal-close");
    const galleryTrack = document.getElementById("gallery-track");
    const galleryDots = document.getElementById("gallery-dots");

    // Variables de Estado
    let todosLosProductos = [];
    let productosFiltrados = [];
    let paginaActual = 1;
    const PRODUCTOS_POR_PAGINA = 20;

    // ---------- Renderizado y Paginación ----------

    function renderizarPagina() {
        if (!grid) return;

        grid.innerHTML = "";
        const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA);

        if (productosFiltrados.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6E6558; padding: 30px 0;">No hay mercancía disponible en esta categoría.</p>';
            if (paginationContainer) paginationContainer.style.display = "none";
            return;
        }

        const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
        const fin = inicio + PRODUCTOS_POR_PAGINA;
        const corte = productosFiltrados.slice(inicio, fin);

        corte.forEach((prod) => {
            let imgUrl = prod.img_url || "https://picsum.photos/id/1025/600/700";
            

            grid.innerHTML += `
                <article class="product-card" data-id="${prod.id}">
                    <div class="product-media">
                        <span class="product-code">$${Number(prod.precio).toFixed(2)}</span>
                        <img src="${imgUrl}" alt="${prod.nombre}" loading="lazy">
                    </div>
                    <p class="product-label">${prod.nombre}</p>
                </article>
            `;
        });

        if (totalPaginas > 1) {
            if (paginationContainer) paginationContainer.style.display = "flex";
            if (pgPrev) pgPrev.disabled = (paginaActual === 1);
            if (pgNext) pgNext.disabled = (paginaActual === totalPaginas);

            if (pgNumbers) {
                pgNumbers.innerHTML = "";
                for (let i = 1; i <= totalPaginas; i++) {
                    const btnPage = document.createElement("button");
                    btnPage.className = `page-num ${i === paginaActual ? 'active' : ''}`;
                    btnPage.innerText = i;
                    btnPage.onclick = () => irAPagina(i);
                    pgNumbers.appendChild(btnPage);
                }
            }
        } else {
            if (paginationContainer) paginationContainer.style.display = "none";
        }
    }

    function irAPagina(numPagina) {
        paginaActual = numPagina;
        renderizarPagina();

        if (wrapper) {
            const yOffset = -80;
            const y = wrapper.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    }

    if (pgPrev) pgPrev.onclick = () => { if (paginaActual > 1) irAPagina(paginaActual - 1); };
    if (pgNext) pgNext.onclick = () => { if (paginaActual < Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA)) irAPagina(paginaActual + 1); };

    function seleccionarCategoria(catId) {
        if (!catId) {
            if (wrapper) wrapper.classList.remove("visible");
            return;
        }

        paginaActual = 1;

        if (catId === "todos") {
            productosFiltrados = [...todosLosProductos];
        } else {
            productosFiltrados = todosLosProductos.filter(p => `cat-${p.categoria_id}` === catId);
        }

        if (wrapper) wrapper.classList.add("visible");
        renderizarPagina();

        if (wrapper) {
            const yOffset = -80;
            const y = wrapper.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    }

    function inicializarFiltros() {
        const filterButtons = document.querySelectorAll(".filter-btn");
        const categoryCards = document.querySelectorAll(".category-card");

        filterButtons.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const catSelected = btn.getAttribute("data-category");
                const yaEstabaActivo = btn.classList.contains("active");

                filterButtons.forEach((b) => b.classList.remove("active"));
                if (btnAll) btnAll.classList.remove("active");

                if (yaEstabaActivo) {
                    seleccionarCategoria(null);
                } else {
                    btn.classList.add("active");
                    seleccionarCategoria(catSelected);
                }
            });
        });

        categoryCards.forEach((card) => {
            card.addEventListener("click", (e) => {
                e.preventDefault();
                const catSelected = card.getAttribute("data-category");

                filterButtons.forEach((b) => {
                    b.classList.toggle("active", b.getAttribute("data-category") === catSelected);
                });
                if (btnAll) btnAll.classList.remove("active");

                seleccionarCategoria(catSelected);
            });
        });

        if (btnAll) {
            btnAll.addEventListener("click", (e) => {
                e.preventDefault();
                filterButtons.forEach((b) => b.classList.remove("active"));
                btnAll.classList.add("active");
                seleccionarCategoria("todos");
            });
        }
    }

    // ---------- Modal Bottom Sheet ----------

    function abrirModal(datos) {
        if (!modal) return;

        const modalTitle = document.getElementById("modal-title");
        const modalPrice = document.getElementById("modal-price");
        const modalDesc = document.getElementById("modal-desc");
        const modalWa = document.getElementById("modal-whatsapp");

        if (modalTitle) modalTitle.innerText = datos.nombre;
        if (modalPrice) modalPrice.innerText = `$${Number(datos.precio).toFixed(2)} MXN`;
        if (modalDesc) modalDesc.innerText = datos.descripcion || "Pieza elaborada artesanalmente en plata ley .925 en el taller de Taxco de Alarcón.";

        const waPhone = "527621202937";
        const waMsg = encodeURIComponent(`Hola, me interesa pedir informes sobre: ${datos.nombre} (${datos.precio ? '$' + datos.precio : ''})`);
        if (modalWa) modalWa.href = `https://wa.me/${waPhone}?text=${waMsg}`;

        if (galleryTrack) galleryTrack.innerHTML = "";
        if (galleryDots) galleryDots.innerHTML = "";

        const imagenes = datos.imagenes && datos.imagenes.length > 0 
            ? datos.imagenes 
            : [datos.img_url || "https://picsum.photos/id/1025/600/700"];

        imagenes.forEach((imgSrc, idx) => {
            if (galleryTrack) {
                const item = document.createElement("div");
                item.className = "gallery-item";
                item.innerHTML = `<img src="${imgSrc}" alt="${datos.nombre}">`;
                galleryTrack.appendChild(item);
            }

            if (galleryDots) {
                const pip = document.createElement("div");
                pip.className = `dot-pip ${idx === 0 ? 'active' : ''}`;
                galleryDots.appendChild(pip);
            }
        });

        if (galleryTrack) {
            galleryTrack.onscroll = () => {
                const index = Math.round(galleryTrack.scrollLeft / galleryTrack.clientWidth);
                if (galleryDots) {
                    const dots = galleryDots.querySelectorAll(".dot-pip");
                    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
                }
            };
        }

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function cerrarModal() {
        if (!modal) return;
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    if (overlay) overlay.addEventListener("click", cerrarModal);
    if (closeBtn) closeBtn.addEventListener("click", cerrarModal);

    document.addEventListener("click", (e) => {
        const card = e.target.closest(".product-card");
        if (card) {
            const prodId = card.getAttribute("data-id");
            const prodData = todosLosProductos.find(p => String(p.id) === String(prodId)) || {
                nombre: card.querySelector(".product-label")?.innerText,
                precio: card.querySelector(".product-code")?.innerText.replace("$", ""),
                img_url: card.querySelector("img")?.src
            };

            abrirModal(prodData);
        }
    });

    // ---------- Carga de Datos API ----------

    async function cargarCatalogo() {
        try {
            const data = CATALOGO_DATA;

            if (data.error || !data.categorias || data.categorias.length === 0) return;

            if (categoryGrid) categoryGrid.innerHTML = "";
            if (filtersContainer) filtersContainer.innerHTML = "";
            todosLosProductos = [];

            data.categorias.forEach((cat) => {
                const catDataAttr = `cat-${cat.id}`;

                let catImgUrl = cat.img_url || "https://picsum.photos/id/1025/600/700";
                

                if (filtersContainer) {
                    filtersContainer.innerHTML += `
                        <button class="filter-btn" data-category="${catDataAttr}">${cat.nombre}</button>
                    `;
                }

                if (categoryGrid) {
                    categoryGrid.innerHTML += `
                        <article class="category-card" data-category="${catDataAttr}">
                            <div class="category-media">
                                <img src="${catImgUrl}" alt="${cat.nombre}">
                            </div>
                            <h3 class="category-title">${cat.nombre}</h3>
                        </article>
                    `;
                }

                if (cat.productos && cat.productos.length > 0) {
                    cat.productos.forEach(prod => {
                        todosLosProductos.push({
                            ...prod,
                            categoria_id: cat.id
                        });
                    });
                }
            });

            inicializarFiltros();

        } catch (error) {
            console.error("Error al cargar el catálogo:", error);
        }
    }

    // ---------- Menú Desplegable Móvil (Fix Vivaldi) ----------
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".mainnav");

    if (toggle && nav) {
        const toggleMenu = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            nav.removeAttribute("style");
            nav.classList.toggle("active");
            
            // Forzado de re-paint/reflow explícito para el motor Blink en Vivaldi
            void nav.offsetHeight; 
        };

        toggle.addEventListener("click", toggleMenu);

        nav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                nav.classList.remove("active");
            });
        });

        document.addEventListener("click", (e) => {
            if (!nav.contains(e.target) && !toggle.contains(e.target)) {
                nav.classList.remove("active");
            }
        });
    }

    cargarCatalogo();
});