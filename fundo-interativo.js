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

    var INTERVALO_QUEDA = 180; // ms entre cada peça a cair

    // Quanto do ecrã as 42 peças devem ocupar (0.30 = ~30%).
    // É este o botão a mexer se quiseres a pilha maior ou mais pequena.
    var OCUPACAO_ALVO = 0.30;

    // Soma das caixas de colisão dos 42 módulos à escala 1 (medido nos SVGs).
    // Serve para calcular a escala que dá a ocupação desejada em cada ecrã.
    var AREA_TOTAL_ESCALA_1 = 2750000;

    function calcularEscala() {
        var alvo = window.innerWidth * window.innerHeight * OCUPACAO_ALVO;
        var escala = Math.sqrt(alvo / AREA_TOTAL_ESCALA_1);
        return Math.max(0.15, Math.min(0.5, escala)); // limites sensatos
    }
    var ESCALA = calcularEscala();

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
        // Hex aleatório dava tons quase brancos (invisíveis no fundo claro) e
        // quase pretos. Gerar em HSL com luminosidade a meio e saturação alta
        // garante cores sempre vivas, longe do preto e do branco.
        // Cores aleatórias de gama total, mas com o maior contraste possível
        // entre si: cada peça sorteia vários candidatos e fica com o que estiver
        // mais longe de todas as cores já usadas (amostragem por ponto distante).
        // Medido: sobe a distância mínima entre as 42 cores de ~4.7 para ~23.
        var CANDIDATOS = 30;
        var coresUsadas = []; // guarda o Lab de cada cor já escolhida

        function gerarCorAleatoria() {
            var letras = "0123456789ABCDEF";
            var cor = "#";
            for (var i = 0; i < 6; i++) cor += letras[Math.floor(Math.random() * 16)];
            return cor;
        }

        function gerarCorContrastante() {
            var melhor = null, melhorDist = -1;
            for (var k = 0; k < CANDIDATOS; k++) {
                var cor = gerarCorAleatoria();
                var lab = hexParaLab(cor);
                var maisPerto = Infinity;
                for (var j = 0; j < coresUsadas.length; j++) {
                    var dist = distLab(lab, coresUsadas[j]);
                    if (dist < maisPerto) maisPerto = dist;
                }
                if (maisPerto > melhorDist) { melhorDist = maisPerto; melhor = cor; }
            }
            coresUsadas.push(hexParaLab(melhor));
            return melhor;
        }

        // Lab: espaço onde a distância entre cores corresponde ao que o olho vê
        // (em RGB, dois valores próximos podem parecer cores muito diferentes).
        function hexParaLab(hex) {
            var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
            if (!m) return [0, 0, 0];
            var c = [1, 2, 3].map(function (i) {
                var v = parseInt(m[i], 16) / 255;
                return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
            });
            var X = (c[0] * 0.4124 + c[1] * 0.3576 + c[2] * 0.1805) / 0.95047;
            var Y = c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
            var Z = (c[0] * 0.0193 + c[1] * 0.1192 + c[2] * 0.9505) / 1.08883;
            function f(t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; }
            return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
        }

        function distLab(a, b) {
            return Math.sqrt(
                Math.pow(a[0] - b[0], 2) +
                Math.pow(a[1] - b[1], 2) +
                Math.pow(a[2] - b[2], 2)
            );
        }

        // Baralha a lista para a ordem de queda ser sempre diferente,
        // mas garantindo que cada módulo cai exatamente uma vez.
        function baralhar(arr) {
            for (var i = arr.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
            }
            return arr;
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
        async function criarElemento(ficheiro) {
            var resultado = await prepararSVG(BASE_PATH + ficheiro, gerarCorContrastante());
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

        // Todos os 42 módulos caem, cada um exatamente uma vez, em ordem aleatória
        var ordemDeQueda = baralhar(meusSVGs.slice());
        ordemDeQueda.forEach(function (ficheiro, indice) {
            setTimeout(function () { criarElemento(ficheiro); }, indice * INTERVALO_QUEDA);
        });

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
