// =============================================================
// PRAGMATIPO — FUNDO (homepage) · v2, ENCAIXE
// Alguns módulos aparecem em posições aleatórias do ecrã, mas
// sempre encostados uns aos outros, numa grelha — o mesmo gesto
// do sistema modular.
//
// NÃO precisa do Matter.js. Podes remover essa linha do embed.
// Não precisa de CSS nenhum: tudo é aplicado por JS, porque o
// Cargo esvazia as declarações dos blocos <style> do embed.
// =============================================================

(function () {
    // --- O QUE PODES AFINAR ------------------------------------------
    var CELULA_MIN = 12;           // limites da célula, em pixels
    var CELULA_MAX = 150;

    // Abaixo desta largura o conjunto deixa de ser um bloco no canto e passa a
    // faixa ao longo do fundo: num ecrã estreito o canto não tem folga para
    // crescer para cima sem tapar o conteúdo.
    var BREAKPOINT = 900;

    var MODOS = {
        canto: { pecas: 9, ocupacao: 0.46 },
        faixa: { pecas: 6, ocupacao: 0.30 }
    };

    // Quão agarrado à âncora fica o conjunto, em células.
    // 0 = colado; valores altos espalham-no.
    var DISPERSAO = 6;
    var MARGEM_CANTO = 1;          // células de folga até às bordas

    function modoAtual() { return window.innerWidth < BREAKPOINT ? 'faixa' : 'canto'; }
    var modo = modoAtual();

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

    // O Cargo é uma SPA: ao voltar à homepage o script corre outra vez.
    // Sem esta guarda ficavam dois conjuntos de peças.
    if (window.__pragmatipoFundoAtivo) return;
    window.__pragmatipoFundoAtivo = true;

    function estilo(el, props) {
        for (var k in props) el.style.setProperty(k, props[k], "important");
    }

    function baralhar(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
        }
        return arr;
    }

    // --- CORES --------------------------------------------------------
    // Aleatórias de gama total, mas com o maior contraste possível entre si:
    // cada peça sorteia vários candidatos e fica com o que estiver mais longe
    // de todas as cores já usadas (amostragem por ponto distante).
    var CANDIDATOS = 30;
    var coresUsadas = [];

    function gerarCorAleatoria() {
        var letras = "0123456789ABCDEF", cor = "#";
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
                var d = distLab(lab, coresUsadas[j]);
                if (d < maisPerto) maisPerto = d;
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
        return Math.sqrt(Math.pow(a[0] - b[0], 2) +
                         Math.pow(a[1] - b[1], 2) +
                         Math.pow(a[2] - b[2], 2));
    }

    // --- CARREGAR E COLORIR UM SVG ------------------------------------
    async function prepararSVG(ficheiro, cor) {
        try {
            var resposta = await fetch(BASE_PATH + ficheiro);
            var doc = new DOMParser().parseFromString(await resposta.text(), "image/svg+xml");
            var svg = doc.querySelector("svg");
            if (!svg) return null;

            var largura = parseFloat(svg.getAttribute("width"));
            var altura = parseFloat(svg.getAttribute("height"));
            if (isNaN(largura) || isNaN(altura)) {
                var vb = (svg.getAttribute("viewBox") || "").split(/\s+/);
                if (vb.length === 4) { largura = parseFloat(vb[2]); altura = parseFloat(vb[3]); }
            }
            if (!largura || !altura || isNaN(largura) || isNaN(altura)) { largura = 100; altura = 100; }

            svg.querySelectorAll("path, rect, circle, polygon, ellipse, polyline, line")
               .forEach(function (forma) {
                    if (forma.getAttribute("fill") !== "none") forma.setAttribute("fill", cor);
                    if (forma.getAttribute("stroke") && forma.getAttribute("stroke") !== "none") {
                        forma.setAttribute("stroke", cor);
                    }
               });

            // 50 unidades de SVG = 1 célula da grelha, a mesma convenção do
            // script.js. É isto que permite as peças encaixarem sem folgas.
            return { svg: svg,
                     celulasL: Math.max(1, Math.round(largura / 50)),
                     celulasA: Math.max(1, Math.round(altura / 50)) };
        } catch (e) {
            console.error("Fundo: erro ao preparar o SVG", ficheiro, e);
            return null;
        }
    }

    // --- GRELHA E ENCAIXE ---------------------------------------------
    // Uma peça só é aceite se não sobrepuser nenhuma e tocar pelo menos uma
    // pela aresta. É o que faz o conjunto crescer colado em vez de disperso.
    var ocupadas = {};
    var colunas = 0, linhas = 0;

    function livre(x, y, l, a) {
        if (x < 0 || y < 0 || x + l > colunas || y + a > linhas) return false;
        for (var i = 0; i < l; i++)
            for (var j = 0; j < a; j++)
                if (ocupadas[(x + i) + "," + (y + j)]) return false;
        return true;
    }

    function marcar(x, y, l, a) {
        for (var i = 0; i < l; i++)
            for (var j = 0; j < a; j++) ocupadas[(x + i) + "," + (y + j)] = true;
    }

    function procurarLugar(l, a) {
        var chaves = Object.keys(ocupadas);

        // Primeira peça. No modo canto nasce encostada ao canto inferior
        // direito; no modo faixa nasce num ponto qualquer do fundo, para o
        // conjunto poder crescer para os lados.
        if (chaves.length === 0) {
            var x = (modo === 'faixa')
                ? Math.floor(Math.random() * Math.max(1, colunas - l))
                : colunas - l - MARGEM_CANTO - Math.floor(Math.random() * DISPERSAO);
            var y = linhas - a - MARGEM_CANTO - Math.floor(Math.random() * DISPERSAO);
            x = Math.max(0, Math.min(x, colunas - l));
            y = Math.max(0, Math.min(y, linhas - a));
            return livre(x, y, l, a) ? { x: x, y: y } : null;
        }

        // Células livres encostadas ao que já existe.
        var fronteira = [], vistas = {};
        var lados = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (var k = 0; k < chaves.length; k++) {
            var p = chaves[k].split(",");
            var px = parseInt(p[0], 10), py = parseInt(p[1], 10);
            for (var d = 0; d < 4; d++) {
                var nx = px + lados[d][0], ny = py + lados[d][1], ch = nx + "," + ny;
                if (!ocupadas[ch] && !vistas[ch]) { vistas[ch] = true; fronteira.push([nx, ny]); }
            }
        }

        // Ordena pela proximidade à âncora, com um ruído de DISPERSAO células.
        // Sem o ruído o conjunto crescia sempre da mesma maneira; sem a
        // ordenação espalhava-se pelo ecrã todo.
        //
        // No modo canto a âncora é o canto inferior direito. No modo faixa só
        // conta a distância ao fundo — o x é indiferente, e é isso que faz o
        // conjunto alastrar na horizontal em vez de subir.
        fronteira.forEach(function (c) {
            var dist = (modo === 'faixa')
                ? (linhas - 1 - c[1]) * 2
                : (colunas - 1 - c[0]) + (linhas - 1 - c[1]);
            c[2] = dist + Math.random() * DISPERSAO * 2;
        });
        fronteira.sort(function (a1, b1) { return a1[2] - b1[2]; });

        // A peça tem de cobrir uma célula da fronteira — daí ficar encostada.
        for (var f = 0; f < fronteira.length; f++) {
            for (var dx = 0; dx < l; dx++) {
                for (var dy = 0; dy < a; dy++) {
                    var ox = fronteira[f][0] - dx, oy = fronteira[f][1] - dy;
                    if (livre(ox, oy, l, a)) return { x: ox, y: oy };
                }
            }
        }
        return null;
    }

    // --- DESENHO -------------------------------------------------------
    var contentor, colocadas = [], celulaPx = 20, totalCelulas = 1;
    var geracao = 0;

    function medirGrelha() {
        colunas = Math.max(1, Math.floor(window.innerWidth / celulaPx));
        linhas = Math.max(1, Math.floor(window.innerHeight / celulaPx));
    }

    function calcularCelula() {
        var alvo = window.innerWidth * window.innerHeight * MODOS[modo].ocupacao;
        var bruta = Math.sqrt(alvo / totalCelulas);
        bruta = Math.max(CELULA_MIN, Math.min(CELULA_MAX, bruta));

        // Arredondada a um PAR de pixels. Com uma célula fracionária — e
        // √(área ÷ células) dá quase sempre coisas como 62,6389 — cada aresta
        // caía a meio de um pixel: as arestas coincidem no cálculo, mas cada
        // peça suaviza a sua e fica uma linha clara entre as duas. Par, e não
        // só inteiro, porque o centro de uma peça é metade da largura dela.
        celulaPx = Math.max(2, 2 * Math.round(bruta / 2));
    }

    // A grelha é a verdade; os pixels são recalculados a partir dela. Assim
    // redimensionar não desmancha o encaixe.
    //
    // A âncora é o canto INFERIOR DIREITO da janela: cada peça guarda quantas
    // células a separam desse canto, e é daí que a posição é calculada. Medido
    // a partir do canto superior esquerdo, redimensionar afastava o conjunto do
    // canto onde ele deve viver.
    function desenhar(p, animar) {
        var l = p.rot % 2 ? p.celulasA : p.celulasL;
        var a = p.rot % 2 ? p.celulasL : p.celulasA;
        var giro = "rotate(" + (p.rot * 90) + "deg)";
        var direita = window.innerWidth - p.dx * celulaPx;
        var fundo = window.innerHeight - p.dy * celulaPx;
        estilo(p.svg, {
            "position": "absolute",
            "left": (direita - (l * celulaPx) / 2) + "px",
            "top": (fundo - (a * celulaPx) / 2) + "px",
            "width": (p.celulasL * celulaPx) + "px",
            "height": (p.celulasA * celulaPx) + "px",
            "will-change": "transform, opacity"
        });
        if (!animar) {
            estilo(p.svg, { "transform": "translate(-50%,-50%) " + giro + " scale(1)", "opacity": "1" });
            return;
        }
        estilo(p.svg, {
            "transform": "translate(-50%,-50%) " + giro + " scale(0.82)",
            "opacity": "0"
        });
        requestAnimationFrame(function () {
            estilo(p.svg, { "transition": "opacity .45s ease, transform .45s cubic-bezier(.2,.9,.3,1)" });
            requestAnimationFrame(function () {
                estilo(p.svg, {
                    "transform": "translate(-50%,-50%) " + giro + " scale(1)",
                    "opacity": "1"
                });
            });
        });
    }

    // --- ARRANQUE ------------------------------------------------------
    async function arrancar() {
        // Sem tamanho de janela a grelha sairia errada e ficava assim para
        // sempre. Acontece com o separador em segundo plano, ou com o router
        // do Cargo a injetar o script antes do layout.
        if (!window.innerWidth || !window.innerHeight) {
            requestAnimationFrame(arrancar);
            return;
        }

        // IMPORTANTE: o contentor vai no FIM do <body>, nunca como primeiro
        // filho. O router do Cargo trata o primeiro <div> do body como o seu
        // contentor de conteúdo e renderiza as páginas lá dentro — o conteúdo
        // herdava então o pointer-events:none e nenhum link era clicável.
        contentor = document.getElementById("animacao-fundo") || document.createElement("div");
        contentor.id = "animacao-fundo";
        document.body.appendChild(contentor);
        estilo(contentor, {
            "position": "fixed", "top": "0", "left": "0",
            "width": "100vw", "height": "100vh", "overflow": "hidden",
            "pointer-events": "none", "z-index": "-1"
        });

        montar();

        // Redimensionar dentro do mesmo modo: a grelha mantém-se e só os
        // pixels são recalculados, por isso o encaixe nunca se desfaz.
        // Atravessar o breakpoint muda a forma do conjunto, e aí não há
        // remendo possível — remonta-se. Com atraso, para não remontar
        // dezenas de vezes durante um arrasto do canto da janela.
        var temporizador = null;
        window.addEventListener("resize", function () {
            if (modoAtual() !== modo) {
                clearTimeout(temporizador);
                temporizador = setTimeout(function () {
                    if (modoAtual() === modo) return;
                    modo = modoAtual();
                    montar();
                }, 260);
                return;
            }
            calcularCelula();
            medirGrelha();
            colocadas.forEach(function (p) { desenhar(p, false); });
        });
    }

    // Monta o conjunto de raiz: limpa o que lá esteja, escolhe peças novas e
    // coloca-as. Usada no arranque e sempre que o modo muda.
    async function montar() {
        contentor.innerHTML = "";
        colocadas = [];
        ocupadas = {};
        coresUsadas = [];

        // 22 módulos, cada um na versão cheia e na pontilhada.
        var todos = [];
        for (var i = 0; i <= 21; i++) {
            var n = (i < 10 ? "0" : "") + i;
            todos.push(n + ".svg");
            todos.push("dot-" + n + ".svg");
        }
        var escolhidos = baralhar(todos).slice(0, Math.min(MODOS[modo].pecas, todos.length));

        var minhaGeracao = ++geracao;

        // Carrega tudo primeiro: só com as dimensões todas é que se pode
        // calcular a célula que dá a ocupação pedida.
        var pecas = [];
        for (var e = 0; e < escolhidos.length; e++) {
            var r = await prepararSVG(escolhidos[e], gerarCorContrastante());
            if (r) pecas.push({ svg: r.svg, celulasL: r.celulasL, celulasA: r.celulasA,
                                rot: Math.floor(Math.random() * 4) });
        }
        if (!pecas.length) return;

        // Uma remontagem pode ter começado durante os carregamentos: se a
        // geração mudou, este lote já não interessa e não vai para o ecrã.
        if (minhaGeracao !== geracao) return;

        totalCelulas = pecas.reduce(function (t, p) { return t + p.celulasL * p.celulasA; }, 0);
        calcularCelula();
        medirGrelha();

        // Colocação de uma vez: primeiro resolve-se a grelha toda, depois
        // entram todas juntas. A animação de entrada é a mesma, só deixou de
        // ser escalonada.
        pecas.forEach(function (p) {
            var l = p.rot % 2 ? p.celulasA : p.celulasL;
            var a = p.rot % 2 ? p.celulasL : p.celulasA;
            var lugar = procurarLugar(l, a);
            if (!lugar) return;                  // sem espaço: esta peça não entra
            p.x = lugar.x; p.y = lugar.y;
            // Distância ao canto inferior direito, em células. É este par que
            // sobrevive ao redimensionamento, não o x/y absoluto.
            p.dx = colunas - (lugar.x + l);
            p.dy = linhas - (lugar.y + a);
            marcar(lugar.x, lugar.y, l, a);
            contentor.appendChild(p.svg);
            colocadas.push(p);
            desenhar(p, true);
        });
    }

    // O Cargo injeta os scripts com a página já carregada, por isso o
    // DOMContentLoaded nunca chega a disparar. Esta guarda cobre os dois casos.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", arrancar);
    } else {
        arrancar();
    }
})();
