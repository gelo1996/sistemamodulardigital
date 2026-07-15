// =============================================================
// PRAGMATIPO — FUNDO INTERATIVO (homepage)
// Módulos SVG caem e empilham-se atrás do conteúdo da página.
//
// Requer o Matter.js carregado ANTES deste ficheiro.
// Não precisa de CSS nenhum: tudo é aplicado por JS, porque o
// Cargo esvazia as declarações dos blocos <style> do embed.
// =============================================================

(function () {
    // --- CAMINHO BASE DOS ASSETS (mesma lógica do script.js) ---
    // Usa a pasta local 'data/' em localhost; no Cargo (ou qualquer outro
    // domínio) vai buscar os mesmos SVGs ao GitHub.
    // Nota: ao contrário do script.js, o file: NÃO conta como local — o
    // fetch() é bloqueado por CORS em file://, e a partir daí só o URL
    // remoto funciona.
    var IS_LOCAL = (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1');
    var BASE_PATH = IS_LOCAL
        ? 'data/'
        : 'https://gelo1996.github.io/sistemamodulardigital/data/';

    var TOTAL_PECAS = 30;
    var ESCALA = 0.5;
    var INTERVALO_QUEDA = 180; // ms entre cada peça a cair

    // O Cargo é uma SPA: ao voltar à homepage o script corre outra vez.
    // Sem esta guarda ficavam dois motores e o dobro das peças.
    if (window.__pragmatipoFundoAtivo) return;
    window.__pragmatipoFundoAtivo = true;

    function arrancar() {
        if (typeof Matter === "undefined") {
            console.error("Fundo interativo: o Matter.js não está carregado.");
            return;
        }

        var Engine = Matter.Engine,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite;

        var engine = Engine.create({ enableSleeping: true });
        var world = engine.world;

        // --- CONTENTOR ---------------------------------------------------
        // Criado e estilizado por JS. Como é o primeiro filho do <body> e usa
        // z-index 0, fica atrás do conteúdo da página; o pointer-events:none
        // deixa os links por baixo continuarem clicáveis.
        var contentor = document.getElementById("animacao-fundo");
        if (!contentor) {
            contentor = document.createElement("div");
            contentor.id = "animacao-fundo";
            document.body.insertBefore(contentor, document.body.firstChild);
        }
        estilo(contentor, {
            "position": "fixed",
            "top": "0",
            "left": "0",
            "width": "100vw",
            "height": "100vh",
            "overflow": "hidden",
            "pointer-events": "none",
            "z-index": "0"
        });

        // --- LISTA DE MÓDULOS --------------------------------------------
        var meusSVGs = [];
        for (var i = 0; i <= 20; i++) {
            var n = (i < 10 ? "0" : "") + i;
            meusSVGs.push(n + ".svg");
            meusSVGs.push("dot-" + n + ".svg");
        }

        // --- PAREDES ------------------------------------------------------
        var elementos = [];
        var espessura = 60;
        var chao, paredeEsq, paredeDir;

        function construirParedes() {
            if (chao) Composite.remove(world, [chao, paredeEsq, paredeDir]);
            var W = window.innerWidth, H = window.innerHeight;
            // Paredes generosas em altura para nenhuma peça escapar pelos lados
            chao = Bodies.rectangle(W / 2, H + espessura / 2, W * 3, espessura, { isStatic: true });
            paredeEsq = Bodies.rectangle(-espessura / 2, H / 2, espessura, H * 3, { isStatic: true });
            paredeDir = Bodies.rectangle(W + espessura / 2, H / 2, espessura, H * 3, { isStatic: true });
            Composite.add(world, [chao, paredeEsq, paredeDir]);
        }
        construirParedes();

        // --- CORES --------------------------------------------------------
        function gerarCorAleatoria() {
            var letras = "0123456789ABCDEF";
            var cor = "#";
            for (var i = 0; i < 6; i++) cor += letras[Math.floor(Math.random() * 16)];
            return cor;
        }

        // --- CARREGAR E COLORIR UM SVG ------------------------------------
        async function prepararSVG(url, cor) {
            try {
                var resposta = await fetch(url);
                var textoSVG = await resposta.text();
                var doc = new DOMParser().parseFromString(textoSVG, "image/svg+xml");
                var svgElement = doc.querySelector("svg");
                if (!svgElement) return null;

                var largura = parseFloat(svgElement.getAttribute("width"));
                var altura = parseFloat(svgElement.getAttribute("height"));

                if (isNaN(largura) || isNaN(altura)) {
                    var viewBox = svgElement.getAttribute("viewBox");
                    if (viewBox) {
                        var partes = viewBox.split(/\s+/);
                        if (partes.length === 4) {
                            largura = parseFloat(partes[2]);
                            altura = parseFloat(partes[3]);
                        }
                    }
                }
                if (isNaN(largura) || isNaN(altura) || !largura || !altura) {
                    largura = 100;
                    altura = 100;
                }

                var formas = svgElement.querySelectorAll("path, rect, circle, polygon, ellipse, polyline, line");
                formas.forEach(function (forma) {
                    if (forma.getAttribute("fill") !== "none") forma.setAttribute("fill", cor);
                    if (forma.getAttribute("stroke") && forma.getAttribute("stroke") !== "none") {
                        forma.setAttribute("stroke", cor);
                    }
                });

                return { svgElement: svgElement, largura: largura, altura: altura };
            } catch (erro) {
                console.error("Fundo interativo: erro ao preparar o SVG:", erro);
                return null;
            }
        }

        // --- CRIAR UMA PEÇA -----------------------------------------------
        async function criarElemento() {
            var ficheiro = meusSVGs[Math.floor(Math.random() * meusSVGs.length)];
            var resultado = await prepararSVG(BASE_PATH + ficheiro, gerarCorAleatoria());
            if (!resultado) return;

            var svgElement = resultado.svgElement;
            var larguraReal = resultado.largura * ESCALA;
            var alturaReal = resultado.altura * ESCALA;

            // Estilos por JS (o Cargo esvaziaria uma regra .falling-svg em CSS)
            estilo(svgElement, {
                "position": "absolute",
                "top": "0",
                "left": "0",
                "will-change": "transform"
            });
            svgElement.style.width = larguraReal + "px";
            svgElement.style.height = alturaReal + "px";
            contentor.appendChild(svgElement);

            var startX = Math.random() * (window.innerWidth - 100) + 50;
            var startY = -alturaReal - 20;

            var corpoFisico = Bodies.rectangle(startX, startY, larguraReal, alturaReal, {
                restitution: 0.1,
                friction: 0.8,
                density: 0.05,
                frictionAir: 0.02
            });
            Matter.Body.setAngularVelocity(corpoFisico, (Math.random() - 0.5) * 0.1);
            Composite.add(world, corpoFisico);

            elementos.push({
                fisica: corpoFisico,
                visual: svgElement,
                metadeLargura: larguraReal / 2,
                metadeAltura: alturaReal / 2
            });
        }

        for (var j = 0; j < TOTAL_PECAS; j++) {
            setTimeout(criarElemento, j * INTERVALO_QUEDA);
        }

        Runner.run(Runner.create(), engine);

        function animar() {
            for (var i = 0; i < elementos.length; i++) {
                var el = elementos[i];
                el.visual.style.transform =
                    "translate(" + (el.fisica.position.x - el.metadeLargura) + "px," +
                    (el.fisica.position.y - el.metadeAltura) + "px) rotate(" +
                    el.fisica.angle + "rad)";
            }
            requestAnimationFrame(animar);
        }
        animar();

        // Reconstrói as paredes todas (não só o chão) e acorda as peças
        window.addEventListener("resize", function () {
            construirParedes();
            for (var i = 0; i < elementos.length; i++) {
                Matter.Sleeping.set(elementos[i].fisica, false);
            }
        });
    }

    function estilo(el, props) {
        for (var k in props) el.style.setProperty(k, props[k], "important");
    }

    // O Cargo injeta os scripts com a página já carregada, por isso o
    // DOMContentLoaded nunca chega a disparar. Esta guarda cobre os dois casos.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", arrancar);
    } else {
        arrancar();
    }
})();
