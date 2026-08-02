// --- CAMINHO BASE DOS ASSETS ---
// Em localhost (VS Code Live Server, etc.) usa a pasta local 'data/'.
// Em qualquer outro sítio (Cargo, GitHub Pages, ...) usa os ficheiros alojados no GitHub.
var IS_LOCAL = (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:');
var BASE_PATH = IS_LOCAL
    ? 'data/'
    : 'https://gelo1996.github.io/sistemamodulardigital/data/';

// --- SISTEMA DE POP-UP (MODAL) E RODAPÉ ---
var showShortcutsModal = false;
var suppressDrawUntilRelease = false; // impede que o clique que fecha o modal desenhe no artboard
var btnAtalhos = { x: 0, y: 0, w: 100, h: 30 };
var btnLetterpress = { x: 0, y: 0, w: 100, h: 30 };
var btnStencil = { x: 0, y: 0, w: 100, h: 30 };
var btnFlip = { x: 0, y: 0, w: 30, h: 30 }; // <-- ADICIONAR AQUI
var btnHome = { x: 0, y: 0, w: 30, h: 30 }; // Voltar a pragmatipo.pt
var btnRodarEsq = { x: 0, y: 0, w: 26, h: 34 }; // seta anti-horária
var btnRodarDir = { x: 0, y: 0, w: 26, h: 34 }; // seta horária

// O rato está dentro de um botão (definido por centro + largura/altura)?
function dentroDe(b) {
    return mouseX > b.x - b.w / 2 && mouseX < b.x + b.w / 2 &&
           mouseY > b.y - b.h / 2 && mouseY < b.y + b.h / 2;
}
var alphabetScrollY = 0;
var modalScrollY = 0;    // posição do scroll dentro do modal
var modalMaxScroll = 0;  // recalculado a cada frame conforme a altura do conteúdo
var categoriasAbertas = {}; // acordeão: que categorias do manual estão expandidas
var modalCatAreas = [];     // zonas clicáveis dos cabeçalhos de categoria (por frame)

// --- SISTEMA DE ARTBOARD E UI ---
var currentArtboardIdx = 0; // 0 = F1, 1 = F2, 2 = F3
var isLandscape = false;    // Controla se a folha está deitada
var artW = 46;
var artH = 66;
var artOffsetX = 0;
var artOffsetY = 0;

// --- SISTEMA DE ARTBOARD ---
var artboardSelect;
var currentArtboard = 'Formato 1 (690x990px)';

// --- VARIÁVEIS BASE PARA O MODO FILL ---
var modulesFill = [];
var moduleSVGStringsFill = [];
var redModulesFill = [];
var blueModulesFill = [];

// --- VARIÁVEIS BASE PARA O MODO DOTTED ---
var modulesDotted = [];
var moduleSVGStringsDotted = [];
var redModulesDotted = [];
var blueModulesDotted = [];

// --- VARIÁVEIS ATIVAS (As que o P5 usa a cada frame) ---
var modules = [];
var moduleSVGStrings = [];
var redModules = [];
var blueModules = [];

var currentVisualTheme = 'fill'; // Controla qual o array acima está ativo
var currentGridStyle = 'lines'; // <-- NOVA VARIÁVEL: Pode ser 'lines' ou 'dots'
var toolIcons = {};

var tileSize = 15;

// --- GRELHA INFINITA E CENTRADA ---
var GRID_W = 200;
var GRID_H = 200;
var GRID_CX = 100;
var GRID_CY = 100;

// --- CONFIGURAÇÃO VISUAL ---
var sidebarWidth = 220;
var topBarHeight = 120;
var ui = {}; // <-- NOVA VARIÁVEL QUE VAI CONTROLAR O LAYOUT
var globalScale = 1; // <-- NOVA VARIÁVEL QUE SINCRONIZA TUDO
var charButtonSize = 30;

var centerX, centerY;
var availableW, availableH;
var uiSlider = { x: 0, y: 0, w: 100, min: 5, max: 60, step: 5 };
var isDraggingSlider = false;
var panX = 0; // NOVA: Movimento da câmara em X
var panY = 0; // NOVA: Movimento da câmara em Y

// --- DADOS ---
var placedObjects = [];
var collisionMap = [];

var storedCharacters = {};
var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

// MODO CARTAZ
// O cartaz tem tela própria, fora do alfabeto. Se partilhasse a tela com uma
// letra, entrar no modo cartaz destruía o que lá estivesse. E ficando fora do
// array `characters`, não entra nas contagens do alfabeto — um cartaz não é uma
// letra e não deve inflacionar as estatísticas.
var CHAVE_CARTAZ = '@CARTAZ';
var modoCartaz = false;
var charAntesDoCartaz = 'A';
var currentChar = "A";

// Opções e Modos
var showSmallGrid = true;
var isDebugMode = false;
var isMirrorModeV = false;
var isMirrorModeH = false;
var showCenterV = false;
var showCenterH = false;
var isOverlapMode = false; // Por defeito, a colisão está ligada

// --- SISTEMA DE GUIAS TIPOGRÁFICAS ---
var showGuides = false;
var draggedGuide = null;
var guidesY = {
    ascender: GRID_CY - 12,
    capHeight: GRID_CY - 8,
    xHeight: GRID_CY - 4,
    baseline: GRID_CY + 4,
    descender: GRID_CY + 10
};
var guidesX = {
    left: GRID_CX - 6,
    right: GRID_CX + 6
};

// Estado
var selectedModule = 0;
var currentRotation = 0;

// --- BOUNDING BOX COM PUNHO DE ROTAÇÃO ---
var isRotatingSelection = false;   // punho a ser arrastado neste momento
var rotateLastAngle = 0;           // último ângulo lido do rato
var rotateAccum = 0;               // graus acumulados desde que se pegou no punho
var rotateStepsApplied = 0;        // quantos saltos de 90º já foram aplicados
var rotateOriginals = [];          // posições no momento em que se pegou no punho
var rotateHandleAngle = -90;       // onde o punho está, em graus (-90 = topo)

// Nome da tecla modificadora, para o manual mostrar o atalho certo em cada
// sistema. O código aceita sempre as duas (metaKey || ctrlKey).
var TECLA_CMD = /Mac|iPod|iPhone|iPad/.test(navigator.platform || '') ? 'Cmd' : 'Ctrl';
var hoveringRotateHandle = false;  // para o cursor reagir

// --- VARIÁVEIS DE SELEÇÃO E DRAG & DROP ---
var selectedObjects = [];
var isDraggingSelection = false;
var dragStartGrid = { x: 0, y: 0 };
var dragOriginals = [];
var selectionBox = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 };

function preload() {
    // Limpa os arrays todos
    modulesFill = []; moduleSVGStringsFill = [];
    modulesDotted = []; moduleSVGStringsDotted = [];

    for (var i = 0; i < 22; i++) {
        // Carrega as versões Fill
        var fileFill = BASE_PATH + nf(i, 2) + '.svg';
        modulesFill[i] = loadImage(fileFill);
        moduleSVGStringsFill[i] = loadStrings(fileFill);

        // Carrega as versões Dotted
        var fileDot = BASE_PATH + 'dot-' + nf(i, 2) + '.svg';
        modulesDotted[i] = loadImage(fileDot);
        moduleSVGStringsDotted[i] = loadStrings(fileDot);
    }

    toolIcons.mover = loadImage(BASE_PATH + 'mover.svg');
    toolIcons.limpar = loadImage(BASE_PATH + 'limpar.svg');
    toolIcons.espelhoV = loadImage(BASE_PATH + 'espelho-vertical.svg');
    toolIcons.espelhoH = loadImage(BASE_PATH + 'espelho-horizontal.svg');
    toolIcons.grelhaMenor = loadImage(BASE_PATH + 'grelha-menor.svg');
    toolIcons.centroV = loadImage(BASE_PATH + 'centro-vertical.svg');
    toolIcons.centroH = loadImage(BASE_PATH + 'centro-horizontal.svg');
    toolIcons.guias = loadImage(BASE_PATH + 'guias.svg');
    toolIcons.enquadrar = loadImage(BASE_PATH + 'enquadrar.svg');
    toolIcons.voltar = loadImage(BASE_PATH + 'voltar.svg');
    toolIcons.avancar = loadImage(BASE_PATH + 'avancar.svg');
    toolIcons.limparLetra = loadImage(BASE_PATH + 'limpar-letra.svg');
    toolIcons.limparAlfabeto = loadImage(BASE_PATH + 'limpar-alfabeto.svg'); // <-- ADICIONE AQUI
    toolIcons.moverTela = loadImage(BASE_PATH + 'mover-tela.svg');

    toolIcons.importar = loadImage(BASE_PATH + 'importar.svg');
    toolIcons.guardar = loadImage(BASE_PATH + 'guardar.svg');
    toolIcons.exportarLetra = loadImage(BASE_PATH + 'exportar-letra.svg');
    toolIcons.exportarAlfabeto = loadImage(BASE_PATH + 'exportar-alfabeto.svg');
    toolIcons.exportarZip = loadImage(BASE_PATH + 'exportar-zip.svg');

    toolIcons.atalhos = loadImage(BASE_PATH + 'atalhos.svg');

    toolIcons.rodarEsq = loadImage(BASE_PATH + 'arrow-counter-clockwise.svg');
    toolIcons.rodarDir = loadImage(BASE_PATH + 'arrow-clockwise.svg');

    toolIcons.sobrepor = loadImage(BASE_PATH + 'sobrepor.svg'); // Garante que tens este ficheiro
}

function updateArtboardBounds() {
    if (currentArtboardIdx === 0) { artW = 46; artH = 66; }
    else if (currentArtboardIdx === 1) { artW = 66; artH = 94; }
    else if (currentArtboardIdx === 2) { artW = 94; artH = 132; }

    // Inverte a orientação se estiver em Landscape
    if (isLandscape) {
        var temp = artW;
        artW = artH;
        artH = temp;
    }

    artOffsetX = GRID_CX - Math.floor(artW / 2);
    artOffsetY = GRID_CY - Math.floor(artH / 2);
}

// Verifica se um módulo cabe por inteiro dentro do artboard atual
function isObjInsideArtboard(obj) {
    var dims = getModuleDims(obj.type);
    var v = getFillVectors(obj.rot);
    var minX = artOffsetX, maxX = artOffsetX + artW;
    var minY = artOffsetY, maxY = artOffsetY + artH;
    for (var i = 0; i < dims.len; i++) {
        for (var j = 0; j < dims.wid; j++) {
            if (isCollisionException(obj.type, i, j)) continue;
            var px = obj.x + (v.p.x * i) + (v.s.x * j);
            var py = obj.y + (v.p.y * i) + (v.s.y * j);
            if (px < minX || px >= maxX || py < minY || py >= maxY) return false;
        }
    }
    return true;
}

// Ao mudar de formato/orientação, apaga (com undo por letra) os módulos que ficam fora da folha
function cleanupOutOfBoundsModules() {
    saveCharacter(currentChar); // garante que a letra atual está na memória antes do varrimento

    for (var i = 0; i < characters.length; i++) {
        var char = characters[i];
        var store = storedCharacters[char];
        if (!store || store.objects.length === 0) continue;

        var inside = store.objects.filter(isObjInsideArtboard);
        if (inside.length === store.objects.length) continue; // nada fora, nada a fazer

        // Regista o undo desta letra antes de apagar (mesma regra do saveHistory)
        if (store.history.length >= 15) store.history.shift();
        store.history.push(JSON.parse(JSON.stringify(store.objects)));
        store.redoHistory = [];

        store.objects = inside;
    }

    // Recarrega a letra atual, que pode ter perdido módulos
    placedObjects = JSON.parse(JSON.stringify(storedCharacters[currentChar].objects));
    rebuildCollisionMap();
    selectedObjects = [];
}

// O Cargo esvazia as declarações dos blocos <style> do embed, deixando o canvas
// em position:static e empurrado para fora do ecrã. Estilos aplicados por JS
// não passam por esse filtro, por isso o layout é forçado aqui.
function forceCanvasLayout(cnv) {
    var el = (cnv && cnv.elt) ? cnv.elt : document.querySelector('canvas.p5Canvas');
    if (el) {
        el.style.setProperty('display', 'block', 'important');
        el.style.setProperty('position', 'fixed', 'important');
        el.style.setProperty('top', '0', 'important');
        el.style.setProperty('left', '0', 'important');
        el.style.setProperty('z-index', '9998', 'important');
    }
    var nodes = [document.body, document.documentElement];
    for (var i = 0; i < nodes.length; i++) {
        if (!nodes[i]) continue;
        nodes[i].style.setProperty('margin', '0', 'important');
        nodes[i].style.setProperty('padding', '0', 'important');
        nodes[i].style.setProperty('overflow', 'hidden', 'important');
    }
}

function setup() {
    // Desenha à resolução real do ecrã (Retina = 2x): sem isto, o p5 pode
    // renderizar a 1x e o texto/linhas ficam com ar pixelizado.
    pixelDensity(displayDensity());
    var cnv = createCanvas(windowWidth, windowHeight);
    forceCanvasLayout(cnv);
    rectMode(CENTER);
    imageMode(CENTER);
    strokeWeight(0.75);
    textSize(8);
    textAlign(CENTER, CENTER);
    angleMode(DEGREES);

    collisionMap = createCollisionMap();

    for (var i = 0; i < 22; i++) {
        redModulesFill[i] = createRedVersion(modulesFill[i]);
        blueModulesFill[i] = createBlueVersion(modulesFill[i]);
        redModulesDotted[i] = createRedVersion(modulesDotted[i]);
        blueModulesDotted[i] = createBlueVersion(modulesDotted[i]);
    }

    setVisualTheme('fill');
    updateArtboardBounds(); // Inicia com o Formato 1 Vertical
    calculateLayout();

    initAllCharacters();
    loadCharacter("A");

    // Devolve o trabalho da sessão anterior, se existir
    if (recuperarTrabalho()) {
        avisoRecuperado = 300;              // ~5 segundos de nota no canto
        ultimaAssinatura = assinaturaDoTrabalho();
        calculateLayout();
    }

    aplicarTipoDeLetraDoSite();
    iniciarPortao();   // o manual só abre depois do portão
}

function createRedVersion(img) {
    var w = img.width > 10 ? img.width : 100;
    var h = img.height > 10 ? img.height : 100;
    var pg = createGraphics(w, h);
    pg.image(img, 0, 0, w, h);
    pg.drawingContext.globalCompositeOperation = 'source-in';
    pg.background(255, 50, 50);
    return pg;
}

function createBlueVersion(img) {
    var w = img.width > 10 ? img.width : 100;
    var h = img.height > 10 ? img.height : 100;
    var pg = createGraphics(w, h);
    pg.image(img, 0, 0, w, h);
    pg.drawingContext.globalCompositeOperation = 'source-in';
    pg.background(0, 200, 0);
    return pg;
}

function calculateLayout() {
    // A largura ideal é o que tem MESMO de caber lado a lado, à escala 1:
    // a paleta de módulos, o intervalo mínimo, os menus e a margem direita.
    // Era um 1145 fixo, e por isso a escala começava a encolher enquanto ainda
    // sobravam 24 px de folga — o intervalo nunca chegava ao mínimo, ficava
    // preso nos 35. Derivado, a folga é consumida primeiro e só depois é que
    // a interface inteira encolhe.
    var nModulos = (typeof modules !== 'undefined' && modules.length) ? modules.length : 22;
    var fimDaPaleta = 30 + (nModulos - 1) * 45 + 34 / 2;
    var idealTotalWidth = fimDaPaleta + 11 + 100 + 18;   // paleta · intervalo · menu · margem
    globalScale = min(1.0, width / idealTotalWidth);

    topBarHeight = 160 * globalScale;

    sidebarWidth = 150 * globalScale;
    availableW = width - sidebarWidth;
    availableH = height - topBarHeight;

    centerX = sidebarWidth + availableW / 2 + panX;
    centerY = topBarHeight + availableH / 2 + panY;

    var tBoxSize = 34 * globalScale;
    var toolGapX = 45 * globalScale;
    var toolStartX = 30 * globalScale;
    var ty = 35 * globalScale;

    // Matemática base do nosso Novo Slider JS
    var sliderBoxW = (4 * toolGapX) + tBoxSize;
    var sliderBoxCX = toolStartX + (14 * toolGapX);

    uiSlider.w = sliderBoxW - (30 * globalScale); // A largura real da calha
    uiSlider.x = sliderBoxCX - (uiSlider.w / 2); // Onde começa a calha
    uiSlider.y = ty;
}

function draw() {
    background(238);

    // LÓGICA DAS GUIAS
    if (draggedGuide) {
        if (draggedGuide === 'left' || draggedGuide === 'right') {
            var localX = mouseX - centerX;
            var gX = round(localX / tileSize) + GRID_CX;
            if (draggedGuide === 'left') gX = constrain(gX, 0, guidesX.right - 1);
            else if (draggedGuide === 'right') gX = constrain(gX, guidesX.left + 1, GRID_W - 1);
            guidesX[draggedGuide] = gX;
        } else {
            var localY = mouseY - centerY;
            var gY = round(localY / tileSize) + GRID_CY;
            if (draggedGuide === 'ascender') gY = constrain(gY, 0, guidesY.capHeight - 1);
            else if (draggedGuide === 'capHeight') gY = constrain(gY, guidesY.ascender + 1, guidesY.xHeight - 1);
            else if (draggedGuide === 'xHeight') gY = constrain(gY, guidesY.capHeight + 1, guidesY.baseline - 1);
            else if (draggedGuide === 'baseline') gY = constrain(gY, guidesY.xHeight + 1, guidesY.descender - 1);
            else if (draggedGuide === 'descender') gY = constrain(gY, guidesY.baseline + 1, GRID_H - 1);
            guidesY[draggedGuide] = gY;
        }
    }

    try {
        drawGrid();
        desenharLetraReferencia();   // por baixo da letra atual, nunca por cima
        drawModules();
    } catch (e) {
        console.error(e);
    }

    if (selectionBox.active) {
        selectionBox.currentX = max(sidebarWidth, min(width, mouseX));
        selectionBox.currentY = max(topBarHeight, min(height, mouseY));

        var minX = min(selectionBox.startX, selectionBox.currentX);
        var maxX = max(selectionBox.startX, selectionBox.currentX);
        var minY = min(selectionBox.startY, selectionBox.currentY);
        var maxY = max(selectionBox.startY, selectionBox.currentY);

        var gMinX = floor((minX - centerX) / tileSize);
        var gMaxX = floor((maxX - centerX) / tileSize);
        var gMinY = floor((minY - centerY) / tileSize);
        var gMaxY = floor((maxY - centerY) / tileSize);

        var snapStartX = centerX + gMinX * tileSize;
        var snapStartY = centerY + gMinY * tileSize;
        var snapEndX = centerX + (gMaxX + 1) * tileSize;
        var snapEndY = centerY + (gMaxY + 1) * tileSize;

        push();
        // Em vez de tracejado, usamos uma caixa com fundo semi-transparente
        // e um contorno sólido, que é muito mais leve para o navegador
        if (selectedModule == -1) {
            stroke(255, 50, 50, 200);      // Borda vermelha
            fill(255, 50, 50, 40);         // Fundo vermelho suave
        } else {
            stroke(0, 200, 0, 200);      // Borda azul
            fill(0, 200, 0, 40);         // Fundo azul suave
        }
        
        strokeWeight(0.75); // Fica mais profissional e elegante
        rectMode(CORNERS);
        rect(snapStartX, snapStartY, snapEndX, snapEndY);
        pop();
    }

    drawSelectionBoundingBox();

    handleInteraction();
    drawCustomCursor(); // desenhado ANTES da UI para os fantasmas ficarem por baixo dos painéis
    drawUI();

    drawShortcutsModal();
    drawWordPreview();

    desenharReguaReferencia();

    // Contagem de módulos: a mesma cápsula do aviso de recuperação, em cinzento.
    // Pousa por cima da miniatura da letra; sem miniatura, encosta ao fundo (ou
    // ao topo da faixa da palavra, para não cair sobre a composição).
    // É uma nota do canvas: com o manual aberto não deve flutuar por cima dele.
    if (!showShortcutsModal) {
        var reg = getReguaBounds();
        var meiaAltura = 14 * globalScale;
        var contCy;
        if (reg.visivel) contCy = reg.y - 6 * globalScale - meiaAltura - 8 * globalScale;
        else if (showWordPreview) contCy = getPreviewBounds().y - meiaAltura - 8 * globalScale;
        else contCy = height - meiaAltura - 14 * globalScale;
        // Só se desenha se couber abaixo da barra de ferramentas.
        if (contCy - meiaAltura > topBarHeight + 8 * globalScale) {
            desenharPilula('modules: ' + placedObjects.length,
                           reg.x + reg.tam / 2, contCy, [249, 235], [120],
                           { largura: reg.tam + 12 * globalScale, contorno: 238 });
        }
    }

    verificarAutosave();
    verificarAvaliacao();
    desenharAvisoRecuperado();
}

function handleInteraction() {
    // Bloqueia o desenho se o manual estiver aberto, ou se o rato estiver
    // sobre a faixa da pré-visualização (fora dela continua tudo a funcionar)
    if (interfaceBloqueada()) return;
    if (menuAberto) return;
    if (showShortcutsModal) return;
    if (sobreFaixaPreview()) return;

    // O clique que fechou o modal não pode desenhar: espera que o rato seja largado
    if (suppressDrawUntilRelease) {
        if (mouseIsPressed) return;
        suppressDrawUntilRelease = false;
    }

    if (keyIsDown(32) || selectedModule === -3) return;
    if (mouseIsPressed && mouseButton == LEFT) {
        if (draggedGuide) return;

        if (mouseX > sidebarWidth && mouseY > topBarHeight) {
            if (selectedModule >= 0 && !selectionBox.active && !isDraggingSelection) attemptSetTile(selectedModule);
            else if (selectedModule == -1 && !selectionBox.active && !isDraggingSelection) attemptDeleteTile();
        }
    }
}

function getHoveredGuide() {
    // A MAGIA ESTÁ AQUI: 
    // Só permite interagir com as guias se a ferramenta "Mover" (-2) estiver ativa.
    if (!showGuides || selectedModule !== -2) return null;

    var closest = null;
    var minDist = 10;

    // Verificar Guias Horizontais (Y)
    var orderY = ['ascender', 'capHeight', 'xHeight', 'baseline', 'descender'];
    for (var i = 0; i < orderY.length; i++) {
        var key = orderY[i];
        var screenY = centerY + (guidesY[key] - GRID_CY) * tileSize;
        var d = abs(mouseY - screenY);
        if (d < minDist && mouseX > sidebarWidth) {
            minDist = d;
            closest = key;
        }
    }

    // Verificar Guias Verticais (X)
    var orderX = ['left', 'right'];
    for (var i = 0; i < orderX.length; i++) {
        var key = orderX[i];
        var screenX = centerX + (guidesX[key] - GRID_CX) * tileSize;
        var d = abs(mouseX - screenX);
        if (d < minDist && mouseY > topBarHeight) {
            minDist = d;
            closest = key;
        }
    }

    return closest;
}

function mousePressed(evento) {
    if (interfaceBloqueada()) return;
    // Um menu aberto apanha o próximo clique: fecha-se, e o clique não passa
    // para o canvas — senão fechar o menu deixava um módulo no artboard.
    if (menuAberto && !dentroDe(btnClear) && !dentroDe(btnExport)) {
        fecharMenu();
        suppressDrawUntilRelease = true;   // este clique fecha, não desenha
        return;
    }
    shiftNoClique = evento ? !!evento.shiftKey : keyIsDown(SHIFT);
    if (mouseButton == LEFT) {
        // A faixa da pré-visualização só apanha os cliques que caem sobre ela;
        // o resto da ferramenta continua a funcionar normalmente.
        if (showWordPreview && sobreFaixaPreview()) {
            var pb = getPreviewBounds();
            var fecharX = pb.x + pb.w - 24 * globalScale;
            var fecharY = pb.y + pb.barraH / 2;
            if (dist(mouseX, mouseY, fecharX, fecharY) < 15 * globalScale) {
                fecharPreview();
                suppressDrawUntilRelease = true;
            }
            return;
        }

        if (showShortcutsModal) {
            var b = getModalBounds();

            // Botão fechar
            var closeX = b.x + b.w / 2 - 30 * globalScale;
            var closeY = b.y - b.h / 2 + 30 * globalScale;
            if (dist(mouseX, mouseY, closeX, closeY) < 18 * globalScale) {
                showShortcutsModal = false; suppressDrawUntilRelease = true;
                return;
            }

            // Clique num cabeçalho de categoria: abre/fecha o acordeão.
            // Só conta dentro da área de conteúdo (títulos fora dela estão
            // recortados e não devem responder).
            var areaTop = (b.y - b.h / 2) + b.headerH;
            var areaBot = (b.y + b.h / 2) - 14 * globalScale;
            for (var ci = 0; ci < modalCatAreas.length; ci++) {
                var a = modalCatAreas[ci];
                var meio = (a.y0 + a.y1) / 2;
                if (mouseY >= a.y0 && mouseY <= a.y1 && meio > areaTop && meio < areaBot &&
                    mouseX > b.x - b.w / 2 && mouseX < b.x + b.w / 2) {
                    categoriasAbertas[a.nome] = !categoriasAbertas[a.nome];
                    return;
                }
            }

            // Clique fora do painel: fecha
            if (mouseX < b.x - b.w / 2 || mouseX > b.x + b.w / 2 || mouseY < b.y - b.h / 2 || mouseY > b.y + b.h / 2) {
                showShortcutsModal = false; suppressDrawUntilRelease = true;
            }
            return;
        }

        if (mouseY < topBarHeight) {
            // Detetar Clique no Novo Slider JS
            if (mouseX > uiSlider.x - 15 && mouseX < uiSlider.x + uiSlider.w + 15 && mouseY > uiSlider.y - 15 && mouseY < uiSlider.y + 15) {
                isDraggingSlider = true;
                updateSliderFromMouse();
                return;
            }
            checkTopBarClick();
        }
        else if (mouseX < sidebarWidth) {
            if (mouseX > btnLetterpress.x - btnLetterpress.w / 2 && mouseX < btnLetterpress.x + btnLetterpress.w / 2 && mouseY > btnLetterpress.y - btnLetterpress.h / 2 && mouseY < btnLetterpress.y + btnLetterpress.h / 2) {
                definirModo(false);
                return;
            }
            if (mouseX > btnStencil.x - btnStencil.w / 2 && mouseX < btnStencil.x + btnStencil.w / 2 && mouseY > btnStencil.y - btnStencil.h / 2 && mouseY < btnStencil.y + btnStencil.h / 2) {
                definirModo(true);
                return;
            }
            if (mouseX > btnAtalhos.x - btnAtalhos.w / 2 && mouseX < btnAtalhos.x + btnAtalhos.w / 2 && mouseY > btnAtalhos.y - btnAtalhos.h / 2 && mouseY < btnAtalhos.y + btnAtalhos.h / 2) {
                abrirManual();
                return;
            }
            if (!isOverlapMode && mouseX > btnFlip.x - btnFlip.w / 2 && mouseX < btnFlip.x + btnFlip.w / 2 && mouseY > btnFlip.y - btnFlip.h / 2 && mouseY < btnFlip.y + btnFlip.h / 2) {
                flipCompositionHorizontal();
                return;
            }
            if (mouseX > btnHome.x - btnHome.w / 2 && mouseX < btnHome.x + btnHome.w / 2 && mouseY > btnHome.y - btnHome.h / 2 && mouseY < btnHome.y + btnHome.h / 2) {
                goToSite();
                return;
            }
            var sm = getSeletorModo();
            if (mouseX > sm.x - sm.w / 2 && mouseX < sm.x + sm.w / 2 &&
                mouseY > sm.y - sm.h / 2 && mouseY < sm.y + sm.h / 2) {
                definirModoCartaz(mouseX > sm.x);   // metade esquerda = alfabeto
                return;
            }
            if (btnPreview.visivel && dentroDe(btnPreview)) {
                if (showWordPreview) fecharPreview(); else abrirPreview();
                return;
            }
            checkSidebarClick();
        }
        else {
            if (keyIsDown(32) || selectedModule === -3) return;

            // Punho de rotação: tem de ser testado antes de tudo, porque fica
            // por cima do artboard e pode sobrepor-se a módulos.
            if (selectedModule == -2 && selectedObjects.length > 0 && !isDraggingSelection) {
                var bb = getSelectionBounds();
                if (bb && dist(mouseX, mouseY, bb.hx, bb.hy) < 12 * globalScale) {
                    isRotatingSelection = true;
                    rotateLastAngle = atan2(mouseY - bb.cy, mouseX - bb.cx);
                    ensureRotationBase();
                    rotateAccum = rotateStepsApplied * 90;
                    saveHistory(); // um único registo de undo para todo o arrasto
                    return;
                }
            }

            if (showGuides && !modoCartaz) {
                var hGuide = getHoveredGuide();
                if (hGuide) { draggedGuide = hGuide; return; }
            }
            if (selectedModule == -2 || selectedModule == -1) {
                var localX = mouseX - centerX; var localY = mouseY - centerY;
                var gX = floor(localX / tileSize) + GRID_CX; var gY = floor(localY / tileSize) + GRID_CY;
                var clickedIdx = findObjectAt(gX, gY);
                if (clickedIdx !== -1) {
                    var clickedObj = placedObjects[clickedIdx];
                    if (!selectedObjects.includes(clickedObj)) {
                        if (!keyIsDown(SHIFT)) selectedObjects = [clickedObj]; else selectedObjects.push(clickedObj);
                        resetRotationBase(); // seleção nova: base e punho a zero
                    }
                    if (selectedModule == -2) {
                        isDraggingSelection = true; dragStartGrid = { x: gX, y: gY }; currentRotation = 0;
                        dragOriginals = JSON.parse(JSON.stringify(selectedObjects));
                        for (var i = 0; i < selectedObjects.length; i++) {
                            var idx = placedObjects.indexOf(selectedObjects[i]);
                            if (idx > -1) placedObjects.splice(idx, 1);
                            removeObjFromCollisionMap(selectedObjects[i]);
                        }
                    }
                } else {
                    selectionBox.active = true; selectionBox.startX = mouseX; selectionBox.startY = mouseY;
                    selectionBox.currentX = mouseX; selectionBox.currentY = mouseY;
                    if (!keyIsDown(SHIFT)) selectedObjects = [];
                    resetRotationBase(); // seleção nova: base e punho a zero
                }
            }
        }
    }

    // ADICIONAR ESTA LINHA NO FINAL DA FUNÇÃO:
    return false; // Bloqueia o navegador de iniciar a seleção nativa

}

function mouseReleased() {
    if (isDraggingSlider) { isDraggingSlider = false; return; } // Liberta o slider
    if (isRotatingSelection) {
        isRotatingSelection = false; // o punho volta a seguir a rotação da peça
        return;
    }

    if (keyIsDown(32)) return; // BLOQUEIO DE CÂMARA
    if (draggedGuide) {
        draggedGuide = null;
        return;
    }

    if (selectionBox.active) {
        selectionBox.active = false;

        var minX = min(selectionBox.startX, selectionBox.currentX);
        var maxX = max(selectionBox.startX, selectionBox.currentX);
        var minY = min(selectionBox.startY, selectionBox.currentY);
        var maxY = max(selectionBox.startY, selectionBox.currentY);

        // A CORREÇÃO ESTÁ AQUI: Voltar a somar o GRID_CX e GRID_CY!
        var gMinX = floor((minX - centerX) / tileSize) + GRID_CX;
        var gMaxX = floor((maxX - centerX) / tileSize) + GRID_CX;
        var gMinY = floor((minY - centerY) / tileSize) + GRID_CY;
        var gMaxY = floor((maxY - centerY) / tileSize) + GRID_CY;

        for (var i = 0; i < placedObjects.length; i++) {
            var obj = placedObjects[i];
            // Agora já vai encontrar as peças porque está a procurar na zona certa (100)
            if (obj.x >= gMinX && obj.x <= gMaxX && obj.y >= gMinY && obj.y <= gMaxY) {
                if (!selectedObjects.includes(obj)) selectedObjects.push(obj);
            }
            resetRotationBase(); // seleção nova por caixa
        }
    } else if (isDraggingSelection) {
        var localX = mouseX - centerX;
        var localY = mouseY - centerY;
        var gX = floor(localX / tileSize) + GRID_CX;
        var gY = floor(localY / tileSize) + GRID_CY;

        var dx = gX - dragStartGrid.x;
        var dy = gY - dragStartGrid.y;

        var objectsToPlace = [];

        for (var i = 0; i < dragOriginals.length; i++) {
            var o = dragOriginals[i];
            objectsToPlace.push({ type: o.type, x: o.x + dx, y: o.y + dy, rot: o.rot });
        }

        var groupWithMirrors = [];
        for (var i = 0; i < objectsToPlace.length; i++) {
            var mirrors = getMirroredGroup(objectsToPlace[i]);
            for (var m = 0; m < mirrors.length; m++) {
                if (!containsObj(groupWithMirrors, mirrors[m])) {
                    groupWithMirrors.push(mirrors[m]);
                }
            }
        }

        if (checkPlacementValidGroup(groupWithMirrors)) {
            saveHistory();
            for (var i = 0; i < groupWithMirrors.length; i++) {
                placedObjects.push(groupWithMirrors[i]);
                addObjToCollisionMap(groupWithMirrors[i]);
            }
            selectedObjects = groupWithMirrors.slice(0, dragOriginals.length);
        } else {
            for (var i = 0; i < dragOriginals.length; i++) {
                var orig = dragOriginals[i];
                placedObjects.push(orig);
                addObjToCollisionMap(orig);
                selectedObjects[i] = orig;
            }
        }

        isDraggingSelection = false;
        dragOriginals = [];
    }
}

function findObjectAt(x, y) {
    for (var k = placedObjects.length - 1; k >= 0; k--) {
        if (doesObjectCover(placedObjects[k], x, y)) return k;
    }
    return -1;
}

// --- CORE: COLISÃO E OTIMIZAÇÃO ---

function createCollisionMap() {
    var map = [];
    for (var x = 0; x < GRID_W; x++) {
        map[x] = [];
        for (var y = 0; y < GRID_H; y++) {
            map[x][y] = [];
        }
    }
    return map;
}

function rebuildCollisionMap() {
    collisionMap = createCollisionMap();
    for (var k = 0; k < placedObjects.length; k++) {
        addObjToCollisionMap(placedObjects[k]);
    }
}

function addObjToCollisionMap(obj) {
    var dims = getModuleDims(obj.type);
    var v = getFillVectors(obj.rot);
    for (var i = 0; i < dims.len; i++) {
        for (var j = 0; j < dims.wid; j++) {
            if (isCollisionException(obj.type, i, j)) continue;
            var px = obj.x + (v.p.x * i) + (v.s.x * j);
            var py = obj.y + (v.p.y * i) + (v.s.y * j);
            if (px >= 0 && px < GRID_W && py >= 0 && py < GRID_H) {
                collisionMap[px][py].push(obj);
            }
        }
    }
}

function removeObjFromCollisionMap(obj) {
    var dims = getModuleDims(obj.type);
    var v = getFillVectors(obj.rot);
    for (var i = 0; i < dims.len; i++) {
        for (var j = 0; j < dims.wid; j++) {
            if (isCollisionException(obj.type, i, j)) continue;
            var px = obj.x + (v.p.x * i) + (v.s.x * j);
            var py = obj.y + (v.p.y * i) + (v.s.y * j);
            if (px >= 0 && px < GRID_W && py >= 0 && py < GRID_H) {
                var cell = collisionMap[px][py];
                var idx = cell.indexOf(obj);
                if (idx > -1) cell.splice(idx, 1);
            }
        }
    }
}

function getMirroredPlacementV(type, x, y, rot) {
    var W = GRID_W - 1;
    var dims = getModuleDims(type);
    if (isCurveGroup(type) || isDiagonalGroup(type)) { // <-- Categoria incluída
        var rotM = { 0: 1, 1: 0, 2: 3, 3: 2 }[rot];
        return { type: type, x: W - x, y: y, rot: rotM };
    }
    else if (isArchGroup(type)) {
        var rotM, xM, yM;
        if (rot == 0) { rotM = 0; xM = W - x - dims.len + 1; yM = y; }
        else if (rot == 1) { rotM = 3; xM = W - x; yM = y + dims.len - 1; }
        else if (rot == 2) { rotM = 2; xM = W - x + dims.len - 1; yM = y; }
        else if (rot == 3) { rotM = 1; xM = W - x; yM = y - dims.len + 1; }
        return { type: type, x: xM, y: yM, rot: rotM };
    }
    else {
        var rotM = rot;
        var xM = 0;
        if (rot == 0) xM = W - x - dims.len + 1;
        if (rot == 1) xM = W - x + dims.wid - 1;
        if (rot == 2) xM = W - x + dims.len - 1;
        if (rot == 3) xM = W - x - dims.wid + 1;
        return { type: type, x: xM, y: y, rot: rotM };
    }
}

function getMirroredPlacementH(type, x, y, rot) {
    var H = GRID_H - 1;
    var dims = getModuleDims(type);
    if (isCurveGroup(type) || isDiagonalGroup(type)) { // <-- Categoria incluída
        var rotM = { 0: 3, 1: 2, 2: 1, 3: 0 }[rot];
        return { type: type, x: x, y: H - y, rot: rotM };
    }
    else if (isArchGroup(type)) {
        var rotM, xM, yM;
        if (rot == 0) { rotM = 2; xM = x + dims.len - 1; yM = H - y; }
        else if (rot == 1) { rotM = 1; xM = x; yM = H - y - dims.len + 1; }
        else if (rot == 2) { rotM = 0; xM = x - dims.len + 1; yM = H - y; }
        else if (rot == 3) { rotM = 3; xM = x; yM = H - y + dims.len - 1; }
        return { type: type, x: xM, y: yM, rot: rotM };
    }
    else {
        var rotM = rot;
        var yM = 0;
        if (rot == 0) yM = H - y - dims.wid + 1;
        if (rot == 1) yM = H - y - dims.len + 1;
        if (rot == 2) yM = H - y + dims.wid - 1;
        if (rot == 3) yM = H - y + dims.len - 1;
        return { type: type, x: x, y: yM, rot: rotM };
    }
}

function getMirroredGroup(baseObj) {
    var group = [baseObj];

    if (isMirrorModeV) {
        var mV = getMirroredPlacementV(baseObj.type, baseObj.x, baseObj.y, baseObj.rot);
        if (!containsObj(group, mV)) group.push(mV);
    }

    if (isMirrorModeH) {
        var currentLen = group.length;
        for (var i = 0; i < currentLen; i++) {
            var mH = getMirroredPlacementH(group[i].type, group[i].x, group[i].y, group[i].rot);
            if (!containsObj(group, mH)) group.push(mH);
        }
    }
    return group;
}

function containsObj(arr, obj) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].type === obj.type && arr[i].x === obj.x && arr[i].y === obj.y && arr[i].rot === obj.rot) return true;
    }
    return false;
}

function checkPlacementValidGroup(group) {
    var added = [];
    var allValid = true;
    for (var i = 0; i < group.length; i++) {
        if (canPlaceTile(group[i].x, group[i].y, group[i].type, group[i].rot)) {
            placedObjects.push(group[i]);
            addObjToCollisionMap(group[i]);
            added.push(group[i]);
        } else {
            allValid = false;
            break;
        }
    }
    for (var i = 0; i < added.length; i++) {
        placedObjects.pop();
        removeObjFromCollisionMap(added[i]);
    }
    return allValid;
}

// --- DEFINIÇÕES DOS MÓDULOS E GEOMETRIA (OTIMIZADO) ---
const MODULE_DIMS = [
    { len: 2, wid: 2 },   // 00
    { len: 4, wid: 2 },   // 01
    { len: 6, wid: 2 },   // 02
    { len: 8, wid: 2 },   // 03
    { len: 10, wid: 2 },  // 04
    { len: 12, wid: 2 },  // 05
    { len: 2, wid: 2 },   // 06
    { len: 4, wid: 4 },   // 07
    { len: 6, wid: 6 },   // 08
    { len: 8, wid: 8 },   // 09
    { len: 10, wid: 10 }, // 10
    { len: 12, wid: 12 }, // 11
    { len: 10, wid: 5 },  // 12
    { len: 6, wid: 3 },   // 13
    { len: 2, wid: 1 },   // 14
    { len: 2, wid: 2 },   // 15
    { len: 2, wid: 2 },   // 16
    { len: 3, wid: 2 },    // 17
    { len: 3, wid: 2 },    // 18
    { len: 3, wid: 2 },    // 19
    { len: 3, wid: 2 },    // 20
    { len: 2, wid: 1 }     // 21 — meia altura, 100x50 (50 unidades = 1 célula)
];

// Ordem em que os módulos aparecem na barra. Quem estiver aqui abre a fila;
// os restantes seguem a seguir, pela ordem natural — assim acrescentar um
// módulo novo não exige mexer nesta lista para ele aparecer.
const ORDEM_MODULOS = [21];

function ordemDosModulos() {
    var ordem = ORDEM_MODULOS.filter(function (i) { return i < modules.length; });
    for (var i = 0; i < modules.length; i++) {
        if (ordem.indexOf(i) === -1) ordem.push(i);
    }
    return ordem;
}

// O número que se mostra não é o índice interno. O índice é posição no array
// e está gravado em cada peça — mexer nele partia todos os alfabetos já
// guardados. Isto é só a etiqueta, e vive num sítio só.
const ETIQUETAS_MODULOS = { 21: '01' };   // casos próprios; o resto soma 2

function etiquetaDoModulo(id) {
    if (ETIQUETAS_MODULOS[id]) return ETIQUETAS_MODULOS[id];
    return nf(id + 2, 2);
}

function getModuleDims(id) {
    return MODULE_DIMS[id] || { len: (id + 1) * 2, wid: 2 };
}

function isCurveGroup(id) { return id >= 6 && id <= 11; }
function isArchGroup(id) { return id >= 12 && id <= 14; }
function isDiagonalGroup(id) { return id >= 16 && id <= 20; } // <-- Atualizado para 20
function hasGeneticMap(id) { return (id >= 0 && id <= 21); }  // <-- Atualizado para 21

function getCurveCenter(gx, gy, type, rot) {
    var dims = getModuleDims(type);
    var L = dims.len;
    var v = getFillVectors(rot);
    return { cx: gx + (v.p.x * L) + (v.s.x * L), cy: gy + (v.p.y * L) + (v.s.y * L) };
}

function isCollisionException(id, i, j) {
    if (id == 7) { if (i == 0 && j == 0) return true; if (i == 3 && j == 3) return true; }
    if (id == 8) { if (i == 0 && j == 0) return true; if (i == 1 && j == 0) return true; if (i == 0 && j == 1) return true; if (i >= 4 && j == 3) return true; if (i >= 3 && j == 4) return true; if (i >= 3 && j == 5) return true; }
    if (id == 9) { if (j == 0 && i <= 3) return true; if (j == 1 && i <= 1) return true; if (j == 2 && i == 0) return true; if (j == 3 && i == 0) return true; if (j == 3 && i >= 5) return true; if (j == 4 && i >= 4) return true; if (j == 5 && i >= 4) return true; if (j == 6 && i >= 4) return true; if (j == 7 && i >= 3) return true; }
    if (id == 10) { if (j == 0 && i <= 4) return true; if (j == 1 && i <= 3) return true; if (j == 2 && i <= 1) return true; if (j == 3 && i <= 1) return true; if (j == 4 && i == 0) return true; if (j == 3 && i >= 7) return true; if (j == 4 && i >= 6) return true; if (j == 5 && i >= 5) return true; if (j == 6 && i >= 4) return true; if (j >= 7 && i >= 3) return true; }
    if (id == 11) { if (j == 0 && i <= 6) return true; if (j == 1 && i <= 4) return true; if (j == 2 && i <= 3) return true; if (j == 3 && i <= 2) return true; if (j == 4 && i <= 1) return true; if (j == 5 && i == 0) return true; if (j == 6 && i == 0) return true; if (j == 3 && i >= 8) return true; if (j == 4 && i >= 6) return true; if (j == 5 && i >= 5) return true; if (j == 6 && i >= 4) return true; if (j == 7 && i >= 4) return true; if (j >= 8 && i >= 3) return true; }

    if (id == 12) {
        if (j == 0 && (i <= 1 || i >= 8)) return true;
        if (j == 1 && (i == 0 || i == 9)) return true;
        if (j >= 3 && (i >= 3 && i <= 6)) return true;
    }
    return false;
}

// --- MOTOR GENÉTICO DE CORES (OTIMIZADO) ---
const MODULE_COLORS = [
    /* 00 */[['Y', 'Y'], ['Y', 'Y']],
    /* 01 */[['Y', 'Y', 'Y', 'Y'], ['Y', 'Y', 'Y', 'Y']],
    /* 02 */[['Y', 'Y', 'Y', 'Y', 'Y', 'Y'], ['Y', 'Y', 'Y', 'Y', 'Y', 'Y']],
    /* 03 */[['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'], ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y']],
    /* 04 */[['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'], ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y']],
    /* 05 */[['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'], ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y']],
    /* 06 */[['B', 'G'], ['G', 'Y']],
    /* 07 */[['T', 'B', 'B', 'G'], ['B', 'Y', 'Y', 'Y'], ['B', 'Y', 'B', 'B'], ['G', 'Y', 'B', 'T']],
    /* 08 */[['T', 'T', 'B', 'B', 'B', 'G'], ['T', 'B', 'B', 'Y', 'Y', 'Y'], ['B', 'B', 'Y', 'Y', 'B', 'B'], ['B', 'Y', 'Y', 'B', 'T', 'T'], ['B', 'Y', 'B', 'T', 'T', 'T'], ['G', 'Y', 'B', 'T', 'T', 'T']],
    /* 09 */[['T', 'T', 'T', 'T', 'B', 'B', 'G', 'G'], ['T', 'T', 'B', 'B', 'Y', 'Y', 'Y', 'Y'], ['T', 'B', 'B', 'Y', 'Y', 'B', 'B', 'B'], ['T', 'B', 'Y', 'Y', 'B', 'T', 'T', 'T'], ['B', 'Y', 'Y', 'B', 'T', 'T', 'T', 'T'], ['B', 'Y', 'B', 'T', 'T', 'T', 'T', 'T'], ['G', 'Y', 'B', 'T', 'T', 'T', 'T', 'T'], ['G', 'Y', 'B', 'T', 'T', 'T', 'T', 'T']],
    /* 10 */[['T', 'T', 'T', 'T', 'T', 'B', 'B', 'B', 'G', 'G'], ['T', 'T', 'T', 'T', 'B', 'B', 'Y', 'Y', 'Y', 'Y'], ['T', 'T', 'B', 'B', 'Y', 'Y', 'B', 'B', 'B', 'B'], ['T', 'T', 'B', 'Y', 'Y', 'B', 'T', 'T', 'T', 'T'], ['T', 'B', 'Y', 'Y', 'B', 'T', 'T', 'T', 'T', 'T'], ['B', 'B', 'Y', 'B', 'T', 'T', 'T', 'T', 'T', 'T'], ['B', 'Y', 'B', 'T', 'T', 'T', 'T', 'T', 'T', 'T'], ['B', 'Y', 'B', 'T', 'T', 'T', 'T', 'T', 'T', 'T'], ['G', 'Y', 'B', 'T', 'T', 'T', 'T', 'T', 'T', 'T'], ['G', 'Y', 'B', 'T', 'T', 'T', 'T', 'T', 'T', 'T']],
    /* 11 */[['T', 'T', 'T', 'T', 'T', 'T', 'T', 'B', 'B', 'B', 'Y', 'Y'], ['T', 'T', 'T', 'T', 'T', 'B', 'B', 'Y', 'Y', 'Y', 'Y', 'Y'], ['T', 'T', 'T', 'T', 'B', 'Y', 'Y', 'Y', 'B', 'B', 'B', 'B'], ['T', 'T', 'T', 'B', 'Y', 'Y', 'B', 'B', 'T', 'T', 'T', 'T'], ['T', 'T', 'B', 'Y', 'Y', 'B', 'T', 'T', 'T', 'T', 'T', 'T'], ['T', 'B', 'Y', 'Y', 'B', 'T', 'T', 'T', 'T', 'T', 'T', 'T'], ['T', 'B', 'Y', 'B', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T'], ['B', 'Y', 'Y', 'B', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T'], ['B', 'Y', 'B', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T'], ['B', 'Y', 'B', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T'], ['Y', 'Y', 'B', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T'], ['Y', 'Y', 'B', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T', 'T']],
    /* 12 */[['T', 'T', 'B', 'B', 'G', 'G', 'B', 'B', 'T', 'T'], ['T', 'B', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'B', 'T'], ['B', 'Y', 'Y', 'B', 'B', 'B', 'B', 'Y', 'Y', 'B'], ['G', 'Y', 'B', 'T', 'T', 'T', 'T', 'B', 'Y', 'G'], ['G', 'Y', 'B', 'T', 'T', 'T', 'T', 'B', 'Y', 'G']],
    /* 13 */[['B', 'B', 'G', 'G', 'B', 'B'], ['B', 'Y', 'Y', 'Y', 'Y', 'B'], ['G', 'Y', 'B', 'B', 'Y', 'G']],
    /* 14 */[['G', 'G']],
    /* 15 */[['G', 'G'], ['G', 'G']],
    /* 16 */[['T', 'B'], ['B', 'Y']],
    /* 17 */[['B', 'Y', 'B'], ['Y', 'Y', 'B']], // ADN do 17: J0=[Azul,Amarelo,Azul], J1=[Amarelo,Amarelo,Azul]
    /* 18 */[['B', 'Y', 'B'], ['B', 'Y', 'Y']], // <-- O ADN do 18
    /* 19 */[['B', 'Y', 'G'], ['G', 'Y', 'B']], // <-- Adicionar vírgula aqui
    /* 20 */[['Y', 'Y', 'B'], ['B', 'Y', 'Y']], // <-- ADN DO 20 (Amarelo e Azul)
    /* 21 */[['Y', 'Y']]                        // duas células cheias: não sobrepõe cor nenhuma
];

function getModuleColor(type, i, j) {
    if (MODULE_COLORS[type] && MODULE_COLORS[type][j] && MODULE_COLORS[type][j][i]) {
        return MODULE_COLORS[type][j][i];
    }
    return 'E';
}

function isAllowed14(typeBase, jBase, iBase, j14, i14, rotBase, rot14) {
    var relRot = (rot14 - rotBase + 4) % 4;

    if (typeBase == 7) {
        if (j14 == 0 && i14 == 0 && (jBase == 3 && iBase == 2 || jBase == 2 && iBase == 3) && relRot == 0) return true;
        if (j14 == 0 && i14 == 1 && (jBase == 3 && iBase == 2 || jBase == 2 && iBase == 3) && relRot == 3) return true;
        return false;
    }
    if (typeBase == 8) {
        if (j14 == 0 && i14 == 0 && ((jBase == 5 && iBase == 2) || (jBase == 3 && iBase == 3) || (jBase == 2 && iBase == 5)) && relRot == 0) return true;
        if (j14 == 0 && i14 == 1 && ((jBase == 5 && iBase == 2) || (jBase == 3 && iBase == 3) || (jBase == 2 && iBase == 5)) && relRot == 3) return true;
        if (j14 == 0 && i14 == 0 && ((jBase == 2 && iBase == 0) || (jBase == 1 && iBase == 1) || (jBase == 0 && iBase == 2)) && relRot == 2) return true;
        if (j14 == 0 && i14 == 1 && ((jBase == 2 && iBase == 0) || (jBase == 1 && iBase == 1) || (jBase == 0 && iBase == 2)) && relRot == 1) return true;
        return false;
    }
    if (typeBase == 9) {
        if (j14 == 0 && i14 == 0 && ((jBase == 7 && iBase == 2) || (jBase == 4 && iBase == 3) || (jBase == 3 && iBase == 4) || (jBase == 2 && iBase == 7)) && relRot == 0) return true;
        if (j14 == 0 && i14 == 1 && ((jBase == 7 && iBase == 2) || (jBase == 4 && iBase == 3) || (jBase == 3 && iBase == 4) || (jBase == 2 && iBase == 7)) && relRot == 3) return true;
        if (j14 == 0 && i14 == 0 && ((jBase == 1 && iBase == 2) || (jBase == 2 && iBase == 1)) && relRot == 2) return true;
        if (j14 == 0 && i14 == 1 && ((jBase == 1 && iBase == 2) || (jBase == 2 && iBase == 1)) && relRot == 1) return true;
        return false;
    }
    if (typeBase == 10) {
        if (j14 == 0 && i14 == 0 && ((jBase == 9 && iBase == 2) || (jBase == 2 && iBase == 9)) && relRot == 0) return true;
        if (j14 == 0 && i14 == 1 && ((jBase == 9 && iBase == 2) || (jBase == 2 && iBase == 9)) && relRot == 3) return true;
        if (j14 == 0 && i14 == 0 && ((jBase == 5 && iBase == 0) || (jBase == 2 && iBase == 2) || (jBase == 0 && iBase == 5)) && relRot == 2) return true;
        if (j14 == 0 && i14 == 1 && ((jBase == 5 && iBase == 0) || (jBase == 2 && iBase == 2) || (jBase == 0 && iBase == 5)) && relRot == 1) return true;
        return false;
    }
    if (typeBase == 11) {
        if (j14 == 0 && i14 == 0 && ((jBase == 7 && iBase == 3) || (jBase == 3 && iBase == 7) || (jBase == 2 && iBase == 11) || (jBase == 11 && iBase == 2)) && relRot == 0) return true;
        if (j14 == 0 && i14 == 1 && ((jBase == 7 && iBase == 3) || (jBase == 3 && iBase == 7) || (jBase == 2 && iBase == 11) || (jBase == 11 && iBase == 2)) && relRot == 3) return true;
        if (j14 == 0 && i14 == 0 && ((jBase == 1 && iBase == 5) || (jBase == 5 && iBase == 1)) && relRot == 2) return true;
        if (j14 == 0 && i14 == 1 && ((jBase == 1 && iBase == 5) || (jBase == 5 && iBase == 1)) && relRot == 1) return true;
        return false;
    }
    if (typeBase == 12) {
        if (j14 == 0 && i14 == 0 && ((jBase == 4 && iBase == 2) || (jBase == 2 && iBase == 4)) && relRot == 0) return true;
        if (j14 == 0 && i14 == 0 && ((jBase == 4 && iBase == 7) || (jBase == 2 && iBase == 5)) && relRot == 1) return true;
        if (j14 == 0 && i14 == 1 && ((jBase == 4 && iBase == 7) || (jBase == 2 && iBase == 5)) && relRot == 0) return true;
        if (j14 == 0 && i14 == 1 && ((jBase == 4 && iBase == 2) || (jBase == 2 && iBase == 4)) && relRot == 3) return true;
        return false;
    }
    if (typeBase == 13) {
        if (j14 == 0 && i14 == 0 && jBase == 0 && iBase == 0 && relRot == 2) return true;
        if (j14 == 0 && i14 == 1 && jBase == 0 && iBase == 5 && relRot == 2) return true;
        if (j14 == 0 && i14 == 0 && jBase == 0 && iBase == 5 && relRot == 3) return true;
        if (j14 == 0 && i14 == 1 && jBase == 0 && iBase == 0 && relRot == 1) return true;
        if (j14 == 0 && i14 == 0 && jBase == 2 && iBase == 2 && relRot == 0) return true;
        if (j14 == 0 && i14 == 0 && jBase == 2 && iBase == 3 && relRot == 1) return true;
        if (j14 == 0 && i14 == 1 && jBase == 2 && iBase == 3 && relRot == 0) return true;
        if (j14 == 0 && i14 == 1 && jBase == 2 && iBase == 2 && relRot == 3) return true;
        return false;
    }

    return false;
}

function isAllowed15(typeBase, jBase, iBase, j15, i15, rotBase, rot15) {
    if (typeBase == 7) {
        if ((jBase == 3 && iBase == 2) || (jBase == 2 && iBase == 3)) return true;
        return false;
    }
    if (typeBase == 8) {
        if ((jBase == 5 && iBase == 2) || (jBase == 2 && iBase == 5) ||
            (jBase == 3 && iBase == 3) || (jBase == 2 && iBase == 0) ||
            (jBase == 0 && iBase == 2) || (jBase == 1 && iBase == 1)) return true;
        return false;
    }
    if (typeBase == 9) {
        if ((jBase == 2 && iBase == 7) || (jBase == 3 && iBase == 4) ||
            (jBase == 4 && iBase == 3) || (jBase == 7 && iBase == 2) ||
            (jBase == 1 && iBase == 2) || (jBase == 2 && iBase == 1)) return true;
        return false;
    }
    if (typeBase == 10) {
        if ((jBase == 9 && iBase == 2) || (jBase == 2 && iBase == 9) ||
            (jBase == 5 && iBase == 0) || (jBase == 2 && iBase == 2) ||
            (jBase == 0 && iBase == 5)) return true;
        return false;
    }
    if (typeBase == 11) {
        if ((jBase == 7 && iBase == 3) || (jBase == 3 && iBase == 7) ||
            (jBase == 2 && iBase == 11) || (jBase == 11 && iBase == 2) ||
            (jBase == 1 && iBase == 5) || (jBase == 5 && iBase == 1)) return true;
        return false;
    }
    if (typeBase == 12) {
        if ((jBase == 4 && iBase == 2) || (jBase == 2 && iBase == 4) ||
            (jBase == 4 && iBase == 7) || (jBase == 2 && iBase == 5)) return true;
        return false;
    }
    if (typeBase == 13) {
        if ((jBase == 2 && iBase == 2) || (jBase == 2 && iBase == 3) ||
            (jBase == 0 && iBase == 0) || (jBase == 0 && iBase == 5)) return true;
        return false;
    }
    return false;
}

function check13Override(t1, j1, i1, r1, t2, j2, i2, r2) {
    if (t1 !== 13 && t2 !== 13) return 0;

    var isT1_13 = (t1 == 13);
    var baseT = isT1_13 ? t2 : t1;
    var j13 = isT1_13 ? j1 : j2;
    var i13 = isT1_13 ? i1 : i2;
    var r13 = isT1_13 ? r1 : r2;
    var jB = isT1_13 ? j2 : j1;
    var iB = isT1_13 ? i2 : i1;
    var rB = isT1_13 ? r2 : r1;

    var relRot = (r13 - rB + 4) % 4;

    if (baseT == 7) {
        if (j13 == 2 && i13 == 5 && ((jB == 1 && iB == 0) || (jB == 2 && iB == 0) || (jB == 0 && iB == 1))) return -1;
        if (j13 == 0 && i13 == 0 && jB == 1 && iB == 1) return 1;
        if (j13 == 0 && i13 == 5 && jB == 1 && iB == 1) return 1;
    }
    else if (baseT == 8) {
        if (j13 == 2 && i13 == 0 && jB == 5 && iB == 2 && relRot == 0) return 1;
        if (j13 == 0 && i13 == 0 && ((jB == 2 && iB == 3) || (jB == 3 && iB == 2)) && relRot == 0) return 1;
        if (j13 == 0 && i13 == 2 && jB == 2 && iB == 5 && relRot == 0) return 1;
        if (j13 == 2 && i13 == 5 && jB == 2 && iB == 5 && relRot == 3) return 1;
        if (j13 == 0 && i13 == 5 && ((jB == 2 && iB == 3) || (jB == 3 && iB == 2)) && relRot == 3) return 1;
        if (j13 == 0 && i13 == 3 && jB == 5 && iB == 2 && relRot == 3) return 1;
    }
    else if (baseT == 9) {
        if (j13 == 2 && i13 == 0 && jB == 7 && iB == 2 && relRot == 0) return 1;
        if (j13 == 0 && i13 == 0 && jB == 3 && iB == 3 && relRot == 0) return 1;
        if (j13 == 0 && i13 == 2 && jB == 2 && iB == 7 && relRot == 0) return 1;
        if (j13 == 2 && i13 == 5 && jB == 2 && iB == 7 && relRot == 3) return 1;
        if (j13 == 0 && i13 == 5 && jB == 3 && iB == 3 && relRot == 3) return 1;
        if (j13 == 0 && i13 == 3 && jB == 7 && iB == 2 && relRot == 3) return 1;
    }
    else if (baseT == 10) {
        if (j13 == 0 && i13 == 0 && ((jB == 2 && iB == 6) || (jB == 6 && iB == 2))) return -1;
        if (j13 == 2 && i13 == 0 && jB == 9 && iB == 2 && relRot == 0) return 1;
        if (j13 == 0 && i13 == 0 && ((jB == 4 && iB == 3) || (jB == 3 && iB == 4)) && relRot == 0) return 1;
        if (j13 == 0 && i13 == 2 && jB == 2 && iB == 9 && relRot == 0) return 1;
        if (j13 == 2 && i13 == 5 && jB == 2 && iB == 9 && relRot == 3) return 1;
        if (j13 == 0 && i13 == 5 && ((jB == 4 && iB == 3) || (jB == 3 && iB == 4)) && relRot == 3) return 1;
        if (j13 == 0 && i13 == 3 && jB == 9 && iB == 2 && relRot == 3) return 1;
    }
    else if (baseT == 11) {
        if (j13 == 0 && i13 == 0 && ((jB == 8 && iB == 2) || (jB == 2 && iB == 8))) return -1;
        if (j13 == 2 && i13 == 0 && jB == 11 && iB == 2 && relRot == 0) return 1;
        if (j13 == 0 && i13 == 2 && jB == 2 && iB == 11 && relRot == 0) return 1;
        if (j13 == 2 && i13 == 5 && jB == 2 && iB == 11 && relRot == 3) return 1;
        if (j13 == 0 && i13 == 3 && jB == 11 && iB == 2 && relRot == 3) return 1;
    }
    else if (baseT == 12) {
        // NOVAS LIGAÇÕES 12 vs 13
        if (relRot == 0) {
            if (jB == 2 && iB == 2 && j13 == 0 && i13 == 0) return 2;
            if (jB == 2 && iB == 7 && j13 == 0 && i13 == 5) return 2;
        }
        else if (relRot == 1) {
            if (jB == 3 && iB == 0 && j13 == 0 && i13 == 5) return 2;
            if (jB == 2 && iB == 7 && j13 == 0 && i13 == 0) return 2;
            if (jB == 2 && iB == 5 && j13 == 2 && i13 == 0) return 2;
            if (jB == 4 && iB == 7 && j13 == 0 && i13 == 2) return 2;
        }
        else if (relRot == 2) {
            if (jB == 3 && iB == 0 && j13 == 0 && i13 == 0) return 2;
            if (jB == 3 && iB == 9 && j13 == 0 && i13 == 5) return 2;
        }
        else if (relRot == 3) {
            if (jB == 3 && iB == 9 && j13 == 0 && i13 == 0) return 2;
            if (jB == 2 && iB == 2 && j13 == 0 && i13 == 5) return 2;
            if (jB == 2 && iB == 4 && j13 == 2 && i13 == 5) return 2;
            if (jB == 4 && iB == 2 && j13 == 0 && i13 == 3) return 2;
        }
    }
    return 0;
}

function check07Override(t1, j1, i1, r1, c1, t2, j2, i2, r2, c2) {
    if (t1 !== 7 && t2 !== 7) return 0;

    var isT1_07 = (t1 == 7);
    var baseT = isT1_07 ? t2 : t1;
    var j07 = isT1_07 ? j1 : j2;
    var i07 = isT1_07 ? i1 : i2;
    var r07 = isT1_07 ? r1 : r2;
    var jB = isT1_07 ? j2 : j1;
    var iB = isT1_07 ? i2 : i1;
    var rB = isT1_07 ? r2 : r1;
    var cB = isT1_07 ? c2 : c1;

    var relRot = (r07 - rB + 4) % 4;

    if (baseT == 9) {
        if (j07 == 1 && i07 == 1 && (jB == 1 && iB == 2 || jB == 2 && iB == 1) && relRot == 2) return 1;
    }
    else if (baseT == 10) {
        if (j07 == 1 && i07 == 1 && jB == 2 && iB == 2 && relRot == 2) return 1;
    }
    else if (baseT == 11) {
        if (j07 == 3 && i07 == 0 && cB !== 'T') {
            if (jB == 11 && iB == 2 && relRot == 0) return 1;
            return -1;
        }
        if (j07 == 0 && i07 == 3 && cB !== 'T') {
            if (jB == 2 && iB == 11 && relRot == 0) return 1;
            return -1;
        }
    }
    else if (baseT == 12) {
        if (j07 == 0 && i07 == 3 && (jB == 2 && iB == 5 || jB == 2 && iB == 6 || jB == 4 && iB == 7)) return -1;
        if (j07 == 0 && i07 == 1 && jB == 0 && iB == 3) return -1;
        if (j07 == 1 && i07 == 0 && jB == 0 && iB == 6) return -1;
    }
    return 0;
}

function check08Override(t1, j1, i1, r1, c1, t2, j2, i2, r2, c2) {
    if (t1 !== 8 && t2 !== 8) return 0;

    var isT1_08 = (t1 == 8);
    var baseT = isT1_08 ? t2 : t1;
    var j08 = isT1_08 ? j1 : j2;
    var i08 = isT1_08 ? i1 : i2;
    var r08 = isT1_08 ? r1 : r2;
    var c08 = isT1_08 ? c1 : c2;
    var jB = isT1_08 ? j2 : j1;
    var iB = isT1_08 ? i2 : i1;
    var rB = isT1_08 ? r2 : r1;
    var cB = isT1_08 ? c2 : c1;

    var relRot = (r08 - rB + 4) % 4;

    if (baseT == 11) {
        if (c08 === 'B' && cB === 'Y' && j08 == 2 && i08 == 0 && jB == 5 && iB == 2 && relRot == 2) return 2;
        if (c08 === 'B' && cB === 'Y' && j08 == 0 && i08 == 2 && jB == 2 && iB == 5 && relRot == 2) return 2;
    }
    else if (baseT == 12) {
        if (c08 === 'G' && j08 == 0 && i08 == 5 && jB == 4 && iB == 7) return -1;
        if (c08 === 'B' && cB === 'G' && j08 == 2 && i08 == 0 && jB == 3 && iB == 0 && relRot == 2) return 1;
        if (c08 === 'B' && cB === 'G' && j08 == 0 && i08 == 2 && jB == 3 && iB == 9 && relRot == 3) return 1;
    }
    return 0;
}

function check09Override(t1, j1, i1, r1, c1, t2, j2, i2, r2, c2) {
    if (t1 !== 9 && t2 !== 9) return 0;

    var isT1_09 = (t1 == 9);
    var baseT = isT1_09 ? t2 : t1;
    var j09 = isT1_09 ? j1 : j2;
    var i09 = isT1_09 ? i1 : i2;
    var r09 = isT1_09 ? r1 : r2;
    var c09 = isT1_09 ? c1 : c2;
    var jB = isT1_09 ? j2 : j1;
    var iB = isT1_09 ? i2 : i1;
    var rB = isT1_09 ? r2 : r1;
    var cB = isT1_09 ? c2 : c1;

    var relRot = (r09 - rB + 4) % 4;

    if (baseT == 10) {
        if (c09 === 'G' && cB === 'B' && j09 == 6 && i09 == 0 && jB == 5 && iB == 0 && relRot == 2) return 2;
        if (c09 === 'G' && cB === 'B' && j09 == 0 && i09 == 6 && jB == 0 && iB == 5 && relRot == 2) return 2;
    }
    else if (baseT == 12) {
        if (c09 === 'G' && cB === 'B' && j09 == 0 && i09 == 7 && jB == 4 && iB == 7) return -1;
        if (c09 === 'B' && cB === 'B' && j09 == 0 && i09 == 4 && jB == 0 && iB == 3 && relRot == 2) return -1;
        if (c09 === 'B' && cB === 'B' && j09 == 4 && i09 == 0 && jB == 0 && iB == 6 && relRot == 3) return -1;

        if (c09 === 'B' && cB === 'G') {
            if (j09 == 7 && i09 == 3 && jB == 0 && iB == 4 && relRot == 1) return 2;
            if (j09 == 2 && i09 == 7 && jB == 0 && iB == 4 && relRot == 0) return 2;
            if (j09 == 7 && i09 == 2 && jB == 0 && iB == 5 && relRot == 1) return 2;
            if (j09 == 2 && i09 == 7 && jB == 4 && iB == 9 && relRot == 1) return 2;
            if (j09 == 2 && i09 == 6 && jB == 3 && iB == 9 && relRot == 1) return 2;
            if (j09 == 2 && i09 == 1 && jB == 3 && iB == 0 && relRot == 2) return 2;
            if (j09 == 1 && i09 == 2 && jB == 3 && iB == 9 && relRot == 3) return 2;
        }
    }

    return 0;
}

function check10Override(t1, j1, i1, r1, c1, t2, j2, i2, r2, c2) {
    if (t1 !== 10 && t2 !== 10) return 0;

    var isT1_10 = (t1 == 10);
    var baseT = isT1_10 ? t2 : t1;
    var j10 = isT1_10 ? j1 : j2;
    var i10 = isT1_10 ? i1 : i2;
    var r10 = isT1_10 ? r1 : r2;
    var c10 = isT1_10 ? c1 : c2;
    var jB = isT1_10 ? j2 : j1;
    var iB = isT1_10 ? i2 : i1;
    var rB = isT1_10 ? r2 : r1;
    var cB = isT1_10 ? c2 : c1;

    var relRot = (r10 - rB + 4) % 4;

    if (baseT == 10) {
        if (c10 === 'B' && cB === 'B' && relRot == 2) {
            if ((j10 == 3 && i10 == 2 && jB == 4 && iB == 1) || (j10 == 4 && i10 == 1 && jB == 3 && iB == 2)) return -1;
            if ((j10 == 2 && i10 == 3 && jB == 1 && iB == 4) || (j10 == 1 && i10 == 4 && jB == 2 && iB == 3)) return -1;
        }
    }
    else if (baseT == 11) {
        if (c10 === 'B' && cB === 'Y' && j10 == 2 && i10 == 2 && jB == 2 && iB == 5 && relRot == 2) return 2;
        if (c10 === 'B' && cB === 'Y' && j10 == 2 && i10 == 2 && jB == 5 && iB == 2 && relRot == 2) return 2;
    }
    else if (baseT == 12) {
        if (c10 === 'G' && cB === 'B' && j10 == 0 && i10 == 9 && jB == 4 && iB == 7) return -1;
        if (c10 === 'B' && cB === 'B' && j10 == 2 && i10 == 2 && jB == 0 && iB == 3 && relRot == 2) return -1;
        if (c10 === 'B' && cB === 'B' && j10 == 2 && i10 == 2 && jB == 0 && iB == 6 && relRot == 3) return -1;
        if (c10 === 'B' && cB === 'G' && j10 == 8 && i10 == 2 && jB == 4 && iB == 0) return -1;
        if (c10 === 'B' && cB === 'G' && j10 == 2 && i10 == 9 && jB == 0 && iB == 5) return -1;

        if (c10 === 'B' && cB === 'G') {
            if (j10 == 2 && i10 == 9 && jB == 0 && iB == 4 && relRot == 0) return 2;
            if (j10 == 9 && i10 == 2 && jB == 0 && iB == 5 && relRot == 1) return 2;
            if (j10 == 2 && i10 == 9 && jB == 4 && iB == 9 && relRot == 1) return 2;
            if (j10 == 2 && i10 == 8 && jB == 3 && iB == 9 && relRot == 1) return 2;
            if (j10 == 5 && i10 == 0 && jB == 3 && iB == 0 && relRot == 2) return 2;
            if (j10 == 0 && i10 == 5 && jB == 3 && iB == 9 && relRot == 3) return 2;
        }
    }

    return 0;
}

function check11Override(t1, j1, i1, r1, c1, t2, j2, i2, r2, c2) {
    if (t1 !== 11 && t2 !== 11) return 0;

    var isT1_11 = (t1 == 11);
    var baseT = isT1_11 ? t2 : t1;
    var j11 = isT1_11 ? j1 : j2;
    var i11 = isT1_11 ? i1 : i2;
    var r11 = isT1_11 ? r1 : r2;
    var c11 = isT1_11 ? c1 : c2;
    var jB = isT1_11 ? j2 : j1;
    var iB = isT1_11 ? i2 : i1;
    var rB = isT1_11 ? r2 : r1;
    var cB = isT1_11 ? c2 : c1;

    var relRot = (r11 - rB + 4) % 4;

    if (baseT == 12) {
        if (c11 === 'B' && cB === 'G' && j11 == 2 && i11 == 11 && jB == 0 && iB == 5 && relRot == 0) return -1;
        if (c11 === 'B' && cB === 'G' && j11 == 10 && i11 == 2 && jB == 4 && iB == 0 && relRot == 0) return -1;

        if (c11 === 'B' && cB === 'B' && j11 == 3 && i11 == 3 && jB == 1 && iB == 1 && relRot == 2) return -1;
        if (c11 === 'B' && cB === 'B' && j11 == 1 && i11 == 6 && jB == 0 && iB == 2 && relRot == 2) return -1;

        if (c11 === 'B' && cB === 'B' && j11 == 3 && i11 == 3 && jB == 1 && iB == 8 && relRot == 3) return -1;
        if (c11 === 'B' && cB === 'B' && j11 == 6 && i11 == 1 && jB == 0 && iB == 7 && relRot == 3) return -1;

        if (c11 === 'B' && cB === 'G') {
            if (j11 == 11 && i11 == 2 && jB == 0 && iB == 5 && relRot == 1) return 2;
            if (j11 == 3 && i11 == 7 && jB == 3 && iB == 9 && relRot == 1) return 2;
            if (j11 == 2 && i11 == 10 && jB == 3 && iB == 9 && relRot == 1) return 2;
            if (j11 == 2 && i11 == 11 && jB == 4 && iB == 9 && relRot == 1) return 2;

            if (j11 == 7 && i11 == 0 && jB == 3 && iB == 0 && relRot == 2) return 2;

            if (j11 == 0 && i11 == 7 && jB == 3 && iB == 9 && relRot == 3) return 2;
        }
    }
    return 0;
}

function check12Override(t1, j1, i1, r1, c1, t2, j2, i2, r2, c2) {
    if (t1 !== 12 && t2 !== 12) return 0;

    var isT1_12 = (t1 == 12);
    var baseT = isT1_12 ? t2 : t1;
    var j12 = isT1_12 ? j1 : j2;
    var i12 = isT1_12 ? i1 : i2;
    var r12 = isT1_12 ? r1 : r2;
    var c12 = isT1_12 ? c1 : c2;
    var jB = isT1_12 ? j2 : j1;
    var iB = isT1_12 ? i2 : i1;
    var rB = isT1_12 ? r2 : r1;
    var cB = isT1_12 ? c2 : c1;

    var relRot = (r12 - rB + 4) % 4;

    if (baseT == 12) {
        if (c12 === 'B' && cB === 'B') {
            if (relRot == 2) {
                if ((j12 == 1 && i12 == 1 && jB == 2 && iB == 0) || (j12 == 2 && i12 == 0 && jB == 1 && iB == 1)) return -1;
                if ((j12 == 0 && i12 == 2 && jB == 1 && iB == 1) || (j12 == 1 && i12 == 1 && jB == 0 && iB == 2)) return -1;
                if ((j12 == 0 && i12 == 2 && jB == 0 && iB == 3) || (j12 == 0 && i12 == 3 && jB == 0 && iB == 2)) return -1;

                if ((j12 == 0 && i12 == 7 && jB == 0 && iB == 6) || (j12 == 0 && i12 == 6 && jB == 0 && iB == 7)) return -1;
                if ((j12 == 0 && i12 == 7 && jB == 1 && iB == 8) || (j12 == 1 && i12 == 8 && jB == 0 && iB == 7)) return -1;
                if ((j12 == 1 && i12 == 8 && jB == 2 && iB == 9) || (j12 == 2 && i12 == 9 && jB == 1 && iB == 8)) return -1;
            }
            if (relRot == 1) {
                if (j12 == 1 && i12 == 8 && jB == 2 && iB == 0) return -1;
                if (j12 == 1 && i12 == 8 && jB == 1 && iB == 1) return -1;
                if (j12 == 1 && i12 == 8 && jB == 0 && iB == 2) return -1;

                if (jB == 1 && iB == 1 && j12 == 2 && i12 == 9) return -1;
                if (jB == 1 && iB == 1 && j12 == 1 && i12 == 8) return -1;
                if (jB == 1 && iB == 1 && j12 == 0 && i12 == 7) return -1;
            }
            if (relRot == 3) {
                if (jB == 1 && iB == 8 && j12 == 2 && i12 == 0) return -1;
                if (jB == 1 && iB == 8 && j12 == 1 && i12 == 1) return -1;
                if (jB == 1 && iB == 8 && j12 == 0 && i12 == 2) return -1;

                if (j12 == 1 && i12 == 1 && jB == 2 && iB == 9) return -1;
                if (j12 == 1 && i12 == 1 && jB == 1 && iB == 8) return -1;
                if (j12 == 1 && i12 == 1 && jB == 0 && iB == 7) return -1;
            }
        }
    }

    return 0;
}

function check16Override(t1, j1, i1, r1, c1, t2, j2, i2, r2, c2) {
    if (t1 !== 16 && t2 !== 16) return 0;

    var isT1_16 = (t1 == 16);
    var baseT = isT1_16 ? t2 : t1;
    var j16 = isT1_16 ? j1 : j2;
    var i16 = isT1_16 ? i1 : i2;
    var r16 = isT1_16 ? r1 : r2;
    var c16 = isT1_16 ? c1 : c2;
    var jB = isT1_16 ? j2 : j1;
    var iB = isT1_16 ? i2 : i1;
    var rB = isT1_16 ? r2 : r1;
    var cB = isT1_16 ? c2 : c1;

    var relRot = (r16 - rB + 4) % 4;

    // Relação 16 com 16
    if (baseT == 16) {
        if (c16 === 'B' && cB === 'B') {
            if (relRot == 2) {
                if ((j16 == 1 && i16 == 0 && jB == 0 && iB == 1) || (j16 == 0 && i16 == 1 && jB == 1 && iB == 0)) return 1;
                if (j16 == 0 && i16 == 1 && jB == 0 && iB == 1) return 1;
                if (j16 == 1 && i16 == 0 && jB == 1 && iB == 0) return 1;
            }
            return -1;
        }
    }

    // Relação 16 com 13
    if (baseT == 13) {
        if (relRot == 0) {
            if (j16 == 0 && i16 == 1 && jB == 2 && iB == 3) return -1;
            if (j16 == 0 && i16 == 1 && jB == 2 && iB == 0) return -1;
            if (j16 == 0 && i16 == 1 && jB == 2 && iB == 5) return -1;

            if (j16 == 1 && i16 == 0 && jB == 0 && iB == 5) return -1;
            if (j16 == 1 && i16 == 0 && jB == 1 && iB == 5) return -1;
            if (j16 == 1 && i16 == 0 && jB == 2 && iB == 5) return -1;
        }
        else if (relRot == 1) {
            if (j16 == 0 && i16 == 1 && jB == 1 && iB == 0) return -1;
            if (j16 == 0 && i16 == 1 && jB == 0 && iB == 0) return -1;
            if (j16 == 1 && i16 == 0 && jB == 2 && iB == 2) return -1;
        }
        else if (relRot == 2) {
            if (j16 == 1 && i16 == 0 && jB == 1 && iB == 0) return -1;
            if (j16 == 0 && i16 == 1 && jB == 0 && iB == 1) return -1;
            if (j16 == 0 && i16 == 1 && jB == 0 && iB == 4) return -1;
            if (j16 == 0 && i16 == 1 && jB == 0 && iB == 5) return -1;
        }
        else if (relRot == 3) {
            if (j16 == 0 && i16 == 1 && jB == 1 && iB == 5) return -1;
            if (j16 == 1 && i16 == 0 && jB == 0 && iB == 4) return -1;
            if (j16 == 1 && i16 == 0 && jB == 0 && iB == 1) return -1;
            if (j16 == 1 && i16 == 0 && jB == 0 && iB == 0) return -1;
        }
    }

    // Relação 16 com 07
    if (baseT == 7) {
        if (relRot == 0) {
            if (j16 == 1 && i16 == 0 && jB == 0 && iB == 3) return -1;
            if (j16 == 0 && i16 == 1 && jB == 3 && iB == 0) return -1;
        }
        else if (relRot == 1) {
            if (j16 == 1 && i16 == 0 && (jB == 3 && iB == 2 || jB == 2 && iB == 3)) return -1;
            if (j16 == 0 && i16 == 1 && (jB == 2 && iB == 0 || jB == 1 && iB == 0 || jB == 0 && iB == 1)) return -1;
        }
        else if (relRot == 2) {
            if (j16 == 0 && i16 == 1 && jB == 0 && iB == 2) return -1;
            if (j16 == 1 && i16 == 0 && jB == 2 && iB == 0) return -1;
        }
        else if (relRot == 3) {
            if (j16 == 0 && i16 == 1 && (jB == 3 && iB == 2 || jB == 2 && iB == 3)) return -1;
            if (j16 == 1 && i16 == 0 && (jB == 0 && iB == 2 || jB == 1 && iB == 0 || jB == 0 && iB == 1)) return -1;
        }
    }

    // Relação 16 com 08
    if (baseT == 8) {
        if (relRot == 0) {
            if (j16 == 1 && i16 == 0 && jB == 4 && iB == 2) return -1;
            if (j16 == 0 && i16 == 1 && jB == 2 && iB == 4) return -1;
            if (j16 == 0 && i16 == 1 && jB == 5 && iB == 0) return -1;
            if (j16 == 1 && i16 == 0 && jB == 0 && iB == 5) return -1;
        }
        else if (relRot == 1) {
            if (j16 == 0 && i16 == 1 && (jB == 4 && iB == 0 || jB == 3 && iB == 0 || jB == 2 && iB == 0 || jB == 1 && iB == 1 || jB == 0 && iB == 2)) return -1;
            if (j16 == 1 && i16 == 0 && (jB == 3 && iB == 3 || jB == 2 && iB == 4 || jB == 2 && iB == 5 || jB == 5 && iB == 2)) return -1;
        }
        else if (relRot == 2) {
            if (j16 == 1 && i16 == 0 && (jB == 4 && iB == 0 || jB == 3 && iB == 0 || jB == 2 && iB == 0)) return -1;
            if (j16 == 0 && i16 == 1 && (jB == 0 && iB == 3 || jB == 0 && iB == 4)) return -1;
        }
        else if (relRot == 3) {
            if (j16 == 1 && i16 == 0 && (jB == 2 && iB == 0 || jB == 1 && iB == 1 || jB == 0 && iB == 2 || jB == 0 && iB == 3 || jB == 0 && iB == 4)) return -1;
            if (j16 == 0 && i16 == 1 && (jB == 5 && iB == 2 || jB == 4 && iB == 2 || jB == 3 && iB == 3 || jB == 2 && iB == 5)) return -1;
        }
    }


    // Relação 16 com 09
    if (baseT == 9) {
        if (relRot == 0) {
            if (j16 == 1 && i16 == 0 && (jB == 6 && iB == 2 || jB == 5 && iB == 2 || jB == 0 && iB == 7)) return -1;
            if (j16 == 0 && i16 == 1 && (jB == 7 && iB == 0 || jB == 2 && iB == 6 || jB == 2 && iB == 5)) return -1;
        }
        else if (relRot == 1) {
            if (j16 == 1 && i16 == 0 && (jB == 7 && iB == 2 || jB == 4 && iB == 3 || jB == 3 && iB == 4 || jB == 2 && iB == 5 || jB == 2 && iB == 6 || jB == 2 && iB == 7)) return -1;
            if (j16 == 0 && i16 == 1 && (jB == 5 && iB == 0 || jB == 4 && iB == 0 || jB == 3 && iB == 1 || jB == 2 && iB == 1 || jB == 1 && iB == 2 || jB == 0 && iB == 4)) return -1;
        }
        else if (relRot == 2) {
            if (j16 == 1 && i16 == 0 && (jB == 5 && iB == 0 || jB == 3 && iB == 1)) return -1;
            if (j16 == 0 && i16 == 1 && (jB == 0 && iB == 5 || jB == 1 && iB == 3)) return -1;
        }
        else if (relRot == 3) {
            if (j16 == 0 && i16 == 1 && (jB == 7 && iB == 2 || jB == 6 && iB == 2 || jB == 5 && iB == 2 || jB == 4 && iB == 3 || jB == 3 && iB == 4 || jB == 2 && iB == 7)) return -1;
            if (j16 == 1 && i16 == 0 && (jB == 4 && iB == 0 || jB == 2 && iB == 1 || jB == 1 && iB == 2 || jB == 1 && iB == 3 || jB == 0 && iB == 4 || jB == 0 && iB == 5)) return -1;
        }
    }

    // Relação 16 com 10
    if (baseT == 10) {
        if (relRot == 0) {
            if (j16 == 1 && i16 == 0 && (jB == 8 && iB == 2 || jB == 7 && iB == 2 || jB == 6 && iB == 2 || jB == 5 && iB == 3 || jB == 4 && iB == 4 || jB == 0 && iB == 9)) return -1;
            if (j16 == 0 && i16 == 1 && (jB == 2 && iB == 8 || jB == 2 && iB == 7 || jB == 2 && iB == 6 || jB == 3 && iB == 5 || jB == 4 && iB == 4 || jB == 9 && iB == 0)) return -1;
        }
        else if (relRot == 1) {
            if (j16 == 0 && i16 == 1 && (jB == 7 && iB == 0 || jB == 6 && iB == 0 || jB == 5 && iB == 0 || jB == 4 && iB == 1 || jB == 3 && iB == 2 || jB == 2 && iB == 2 || jB == 1 && iB == 4 || jB == 0 && iB == 5)) return -1;
            if (j16 == 1 && i16 == 0 && (jB == 9 && iB == 2 || jB == 5 && iB == 3 || jB == 4 && iB == 4 || jB == 3 && iB == 5 || jB == 2 && iB == 6 || jB == 2 && iB == 7 || jB == 2 && iB == 8 || jB == 2 && iB == 9 || jB == 3 && iB == 6 || jB == 6 && iB == 3)) return -1;
        }
        else if (relRot == 2) {
            if (j16 == 1 && i16 == 0 && (jB == 6 && iB == 0 || jB == 7 && iB == 0 || jB == 3 && iB == 2)) return -1;
            if (j16 == 0 && i16 == 1 && (jB == 0 && iB == 6 || jB == 0 && iB == 7 || jB == 2 && iB == 3)) return -1;
        }
        else if (relRot == 3) {
            if (j16 == 0 && i16 == 1 && (jB == 9 && iB == 2 || jB == 8 && iB == 2 || jB == 7 && iB == 2 || jB == 6 && iB == 2 || jB == 5 && iB == 3 || jB == 4 && iB == 4 || jB == 3 && iB == 5 || jB == 2 && iB == 9 || jB == 3 && iB == 6 || jB == 6 && iB == 3)) return -1;
            if (j16 == 1 && i16 == 0 && (jB == 0 && iB == 7 || jB == 0 && iB == 6 || jB == 0 && iB == 5 || jB == 1 && iB == 4 || jB == 2 && iB == 3 || jB == 2 && iB == 2 || jB == 4 && iB == 1 || jB == 5 && iB == 0)) return -1;
        }
    }

    // Relação 16 com 11
    if (baseT == 11) {
        if (relRot == 0) {
            if (j16 == 1 && i16 == 0 && (jB == 10 && iB == 2 || jB == 9 && iB == 2 || jB == 8 && iB == 2 || jB == 6 && iB == 3)) return -1;
            if (j16 == 0 && i16 == 1 && (jB == 2 && iB == 10 || jB == 2 && iB == 9 || jB == 2 && iB == 8 || jB == 3 && iB == 6)) return -1;
        }
        else if (relRot == 1) {
            if (j16 == 0 && i16 == 1 && (jB == 9 && iB == 0 || jB == 8 && iB == 0 || jB == 7 && iB == 0 || jB == 6 && iB == 1 || jB == 5 && iB == 1 || jB == 4 && iB == 2 || jB == 3 && iB == 3 || jB == 2 && iB == 4 || jB == 1 && iB == 5 || jB == 0 && iB == 7)) return -1;
            if (j16 == 1 && i16 == 0 && (jB == 11 && iB == 2 || jB == 7 && iB == 3 || jB == 5 && iB == 4 || jB == 4 && iB == 5 || jB == 3 && iB == 6 || jB == 3 && iB == 7 || jB == 2 && iB == 8 || jB == 2 && iB == 9 || jB == 2 && iB == 10 || jB == 2 && iB == 11)) return -1;
        }
        else if (relRot == 2) {
            if (j16 == 1 && i16 == 0 && (jB == 9 && iB == 0 || jB == 8 && iB == 0 || jB == 6 && iB == 1)) return -1;
            if (j16 == 0 && i16 == 1 && (jB == 0 && iB == 9 || jB == 0 && iB == 8 || jB == 1 && iB == 6)) return -1;
        }
        else if (relRot == 3) {
            if (j16 == 0 && i16 == 1 && (jB == 11 && iB == 2 || jB == 10 && iB == 2 || jB == 9 && iB == 2 || jB == 8 && iB == 2 || jB == 7 && iB == 3 || jB == 6 && iB == 3 || jB == 5 && iB == 4 || jB == 4 && iB == 5 || jB == 3 && iB == 7 || jB == 2 && iB == 11)) return -1;
            if (j16 == 1 && i16 == 0 && (jB == 0 && iB == 9 || jB == 0 && iB == 8 || jB == 0 && iB == 7 || jB == 1 && iB == 6 || jB == 1 && iB == 5 || jB == 2 && iB == 4 || jB == 3 && iB == 3 || jB == 4 && iB == 2 || jB == 5 && iB == 1 || jB == 7 && iB == 0)) return -1;
        }
    }

    // Relação 16 com 12
    if (baseT == 12) {
        if (relRot == 0) {
            if (j16 == 1 && i16 == 0 && (jB == 3 && iB == 2 || jB == 2 && iB == 9 || jB == 1 && iB == 8 || jB == 0 && iB == 7 || jB == 4 && iB == 9 || jB == 3 && iB == 9)) return -1;
            if (j16 == 0 && i16 == 1 && (jB == 2 && iB == 5 || jB == 2 && iB == 6 || jB == 4 && iB == 7 || jB == 0 && iB == 7 || jB == 4 && iB == 0 || jB == 4 && iB == 9)) return -1;
        }
        else if (relRot == 1) {
            if (j16 == 0 && i16 == 1 && (jB == 3 && iB == 7 || jB == 2 && iB == 0 || jB == 1 && iB == 1 || jB == 0 && iB == 2 || jB == 3 && iB == 0 || jB == 4 && iB == 0)) return -1;
            if (j16 == 1 && i16 == 0 && (jB == 4 && iB == 2 || jB == 2 && iB == 3 || jB == 2 && iB == 4)) return -1;
        }
        else if (relRot == 2) {
            if (j16 == 1 && i16 == 0 && (jB == 3 && iB == 7 || jB == 4 && iB == 7 || jB == 1 && iB == 1 || jB == 0 && iB == 2)) return -1;
            if (j16 == 0 && i16 == 1 && (jB == 0 && iB == 3 || jB == 0 && iB == 6 || jB == 0 && iB == 7 || jB == 1 && iB == 8 || jB == 2 && iB == 9)) return -1;
        }
        else if (relRot == 3) {
            if (j16 == 0 && i16 == 1 && (jB == 4 && iB == 2 || jB == 3 && iB == 2 || jB == 1 && iB == 8 || jB == 0 && iB == 7)) return -1;
            if (j16 == 1 && i16 == 0 && (jB == 0 && iB == 6 || jB == 0 && iB == 3 || jB == 0 && iB == 2 || jB == 1 && iB == 1 || jB == 2 && iB == 0)) return -1;
        }
    }

    return 0;
}

function check17Override(t1, j1, i1, r1, c1, t2, j2, i2, r2, c2) {
    if (t1 !== 17 && t2 !== 17) return 0;

    var isT1_17 = (t1 == 17);
    var otherT = isT1_17 ? t2 : t1;

    var m17_j = isT1_17 ? j1 : j2;
    var m17_i = isT1_17 ? i1 : i2;
    var m17_r = isT1_17 ? r1 : r2;

    var other_j = isT1_17 ? j2 : j1;
    var other_i = isT1_17 ? i2 : i1;
    var other_r = isT1_17 ? r2 : r1;

    var relRot = (m17_r - other_r + 4) % 4;

    // --- REGRA E [17 \ 17] ---
    if (otherT == 17) {
        if (relRot == 0) {
            if (j1 == 1 && i1 == 0 && j2 == 1 && i2 == 2) return 1;
            if (j2 == 1 && i2 == 0 && j1 == 1 && i1 == 2) return 1;
        }
        if (relRot == 2) {
            if (j1 == 0 && i1 == 0 && j2 == 0 && i2 == 0) return -1;
        }
        if (relRot == 1 || relRot == 3) {
            if (j1 == 0 && i1 == 2 && j2 == 0 && i2 == 0) return -1;
            if (j1 == 1 && i1 == 2 && j2 == 0 && i2 == 2) return -1;
            if (j2 == 0 && i2 == 0 && j1 == 0 && i1 == 2) return -1;
            if (j2 == 0 && i2 == 2 && j1 == 1 && i1 == 2) return -1;
        }
    }

    // --- REGRA E [17 \ 06] (CORRIGIDA) ---
    if (otherT == 6) {
        // Apenas aplica a exceção e o bloqueio se as cores em contacto forem ambas Azuis
        if (c1 === 'B' && c2 === 'B') {
            if (relRot == 0 && m17_j == 1 && m17_i == 2 && other_j == 0 && other_i == 0) return 1;
            return -1;
        }
    }

    // --- REGRA E [17 \ 16] ---
    if (otherT == 16) {
        if (c1 === 'B' && c2 === 'B') {
            if (relRot == 0 && m17_j == 1 && m17_i == 2 && other_j == 1 && other_i == 0) return 1;
            return -1;
        }
    }

    // --- REGRA E [17 \ 07] ---
    if (otherT == 7) {
        if (relRot == 0) {
            if (m17_j == 0 && m17_i == 0 && other_j == 2 && other_i == 3) return -1;
            if (m17_j == 0 && m17_i == 2 && (other_j == 2 && other_i == 0 || other_j == 3 && other_i == 0)) return -1;
        } else if (relRot == 2) {
            if (m17_j == 0 && m17_i == 0 && other_j == 0 && other_i == 1) return -1;
        } else if (relRot == 1 || relRot == 3) {
            if (m17_j == 0 && m17_i == 2 && (other_j == 0 && other_i == 2 || other_j == 1 && other_i == 0 || other_j == 3 && other_i == 2)) return -1;
        }
    }

    // --- REGRA E [17 \ 08] ---
    if (otherT == 8) {
        if (relRot == 0) {
            if (m17_j == 0 && m17_i == 0 && other_j == 2 && other_i == 5) return -1;
            if (m17_j == 0 && m17_i == 2 && (other_j == 5 && other_i == 0 || other_j == 4 && other_i == 0)) return -1;
        } else if (relRot == 1) {
            if (m17_j == 0 && m17_i == 2 && (other_j == 0 && (other_i == 3 || other_i == 4))) return -1;
        } else if (relRot == 3) {
            if (m17_j == 0 && m17_i == 2 && (other_j == 2 && other_i == 4 || other_j == 5 && other_i == 2)) return -1;
        }
    }

    // --- REGRA E [17 \ 09] ---
    if (otherT == 9) {
        if (relRot == 0) {
            if (m17_j == 0 && m17_i == 0 && (other_j == 4 && other_i == 3 || other_j == 3 && other_i == 4 || other_j == 2 && other_i == 7)) return -1;
            if (m17_j == 0 && m17_i == 2 && (other_j == 7 && other_i == 0 || other_j == 6 && other_i == 0)) return -1;
            if (m17_j == 1 && m17_i == 0 && other_j == 7 && other_i == 2) return 1;
        } else if (relRot == 1) {
            if (m17_j == 0 && m17_i == 2 && (other_j == 0 && other_i == 5 || other_j == 1 && other_i == 3 || other_j == 4 && other_i == 0)) return -1;
        } else if (relRot == 2) {
            if (m17_j == 0 && m17_i == 0 && other_j == 0 && other_i == 4) return -1;
        } else if (relRot == 3) {
            if (m17_j == 0 && m17_i == 2 && (other_j == 2 && other_i == 5 || other_j == 3 && other_i == 4 || other_j == 4 && other_i == 3 || other_j == 7 && other_i == 2)) return -1;
        }
    }

    // --- REGRA E [17 \ 10] ---
    if (otherT == 10) {
        if (relRot == 0) {
            if (m17_j == 0 && m17_i == 0 && (other_j == 5 && other_i == 3 || other_j == 4 && other_i == 4 || other_j == 3 && other_i == 5 || other_j == 2 && other_i == 9)) return -1;
            if (m17_j == 0 && m17_i == 2 && (other_j == 8 && other_i == 0 || other_j == 9 && other_i == 0 || other_j == 7 && other_i == 0)) return -1;
            if (m17_j == 1 && m17_i == 0 && other_j == 9 && other_i == 2) return 1;
        } else if (relRot == 1) {
            if (m17_j == 1 && m17_i == 0 && (other_j == 6 && other_i == 3 || other_j == 3 && other_i == 6)) return -1;
            if (m17_j == 0 && m17_i == 2 && (other_j == 0 && other_i == 7 || other_j == 0 && other_i == 6 || other_j == 1 && other_i == 4 || other_j == 2 && other_i == 3 || other_j == 4 && other_i == 1)) return -1;
        } else if (relRot == 2) {
            if (m17_j == 1 && m17_i == 1 && (other_j == 6 && other_i == 3 || other_j == 3 && other_i == 6)) return -1;
            if (m17_j == 0 && m17_i == 0 && (other_j == 4 && other_i == 1 || other_j == 1 && other_i == 4)) return -1;
        } else if (relRot == 3) {
            if (m17_j == 0 && m17_i == 2 && (other_j == 2 && other_i == 6 || other_j == 2 && other_i == 7 || other_j == 3 && other_i == 5 || other_j == 4 && other_i == 4 || other_j == 5 && other_i == 3 || other_j == 9 && other_i == 2)) return -1;
        }
    }

    // --- REGRA E [17 \ 11] ---
    if (otherT == 11) {
        if (relRot == 0) {
            if (m17_j == 0 && m17_i == 0 && (other_j == 5 && other_i == 4 || other_j == 4 && other_i == 5 || other_j == 3 && other_i == 7 || other_j == 2 && other_i == 11)) return -1;
            if (m17_j == 1 && m17_i == 0 && other_j == 11 && other_i == 2) return 1;
        } else if (relRot == 1) {
            if (m17_j == 0 && m17_i == 2 && (other_j == 7 && other_i == 0 || other_j == 6 && other_i == 1 || other_j == 4 && other_i == 2 || other_j == 3 && other_i == 3 || other_j == 2 && other_i == 4 || other_j == 5 && other_i == 1 || other_j == 1 && other_i == 6 || other_j == 0 && other_i == 8 || other_j == 0 && other_i == 9)) return -1;
        } else if (relRot == 2) {
            if (m17_j == 0 && m17_i == 0 && (other_j == 4 && other_i == 2 || other_j == 3 && other_i == 3 || other_j == 2 && other_i == 4 || other_j == 1 && other_i == 5 || other_j == 0 && other_i == 7)) return -1;
        } else if (relRot == 3) {
            if (m17_j == 0 && m17_i == 2 && (other_j == 11 && other_i == 2 || other_j == 7 && other_i == 3 || other_j == 5 && other_i == 4 || other_j == 4 && other_i == 5 || other_j == 3 && other_i == 6 || other_j == 2 && other_i == 8)) return -1;
        }
    }

    // --- REGRA E [17 \ 12] ---
    if (otherT == 12) {
        if (relRot == 0) {
            if (m17_j == 0 && m17_i == 2 && (other_j == 3 && other_i == 7 || other_j == 3 && other_i == 0 || other_j == 4 && other_i == 0)) return -1;
            if (m17_j == 0 && m17_i == 0 && other_j == 4 && other_i == 9) return -1;
        } else if (relRot == 1) {
            if (m17_j == 0 && m17_i == 0 && other_j == 4 && other_i == 7) return -1;
            if (m17_j == 0 && m17_i == 2 && (other_j == 0 && other_i == 3 || other_j == 0 && other_i == 2 || other_j == 1 && other_i == 1 || other_j == 2 && other_i == 0)) return -1;
        } else if (relRot == 2) {
            if (m17_j == 0 && m17_i == 2 && (other_j == 2 && other_i == 9 || other_j == 1 && other_i == 8 || other_j == 0 && other_i == 7)) return -1;
            if (m17_j == 0 && m17_i == 0 && (other_j == 2 && other_i == 0 || other_j == 1 && other_i == 1 || other_j == 0 && other_i == 2)) return -1;
        } else if (relRot == 3) {
            if (m17_j == 0 && m17_i == 2 && (other_j == 4 && other_i == 2 || other_j == 2 && other_i == 3)) return -1;
            if (m17_j == 0 && m17_i == 0 && (other_j == 2 && other_i == 9 || other_j == 1 && other_i == 8 || other_j == 0 && other_i == 7)) return -1;
        }
    }

    // --- REGRA E [17 \ 13] ---
    if (otherT == 13) {
        if (relRot == 1) {
            if (m17_j == 0 && m17_i == 2 && other_j == 0 && other_i == 1) return -1;
        } else if (relRot == 2) {
            if (m17_j == 0 && m17_i == 2 && other_j == 1 && other_i == 5) return -1;
        } else if (relRot == 3) {
            if (m17_j == 0 && m17_i == 2 && other_j == 2 && other_i == 2) return -1;
        }
    }

    return 0;
}

function check18Override(t1, j1, i1, r1, c1, t2, j2, i2, r2, c2) {
    if (t1 !== 18 && t2 !== 18) return 0;

    var isT1_18 = (t1 == 18);
    var otherT = isT1_18 ? t2 : t1;

    // Normalização das coordenadas para leitura direta
    var m18_j = isT1_18 ? j1 : j2;
    var m18_i = isT1_18 ? i1 : i2;
    var m18_r = isT1_18 ? r1 : r2;

    var other_j = isT1_18 ? j2 : j1;
    var other_i = isT1_18 ? i2 : i1;
    var other_r = isT1_18 ? r2 : r1;

    // Diferença de rotação entre o Módulo 18 e a outra peça
    var relRot = (m18_r - other_r + 4) % 4;

    // --- NOVA REGRA E [18 \ 18] (Auto-colisão) ---
    if (otherT == 18) {
        if (relRot == 0) {
            // Permissão especial (Azul com Amarelo)
            if (j1 == 1 && i1 == 0 && j2 == 1 && i2 == 2) return 1;
            if (j2 == 1 && i2 == 0 && j1 == 1 && i1 == 2) return 1; // Espelho da ação
        }
        else if (relRot == 1) {
            // Bloqueios a 90º
            if (j1 == 0 && i1 == 0 && j2 == 1 && i2 == 0) return -1;
            if (j1 == 0 && i1 == 2 && j2 == 0 && i2 == 0) return -1;
        }
        else if (relRot == 2) {
            // Bloqueio a 180º
            if (j1 == 0 && i1 == 2 && j2 == 0 && i2 == 2) return -1;
        }
        else if (relRot == 3) {
            // Bloqueios a 270º (Espelhos exatos dos 90º)
            if (j1 == 0 && i1 == 0 && j2 == 0 && i2 == 2) return -1;
            if (j1 == 1 && i1 == 0 && j2 == 0 && i2 == 0) return -1;
        }
    }

    // --- REGRA E [18 \ 06] ---
    if (otherT == 6) {
        if (relRot == 1) {
            if (m18_j == 0 && m18_i == 2 && other_j == 0 && other_i == 0) return -1;
        }
        if (relRot == 2) {
            if (m18_j == 0 && m18_i == 0 && other_j == 0 && other_i == 0) return -1;
        }
    }

    // --- REGRA E [18 \ 07] ---
    if (otherT == 7) {
        if (relRot == 0) {
            if (m18_j == 0 && m18_i == 0 && other_j == 2 && other_i == 3) return -1;
        }
        else if (relRot == 1) {
            if (m18_j == 0 && m18_i == 2 && other_j == 1 && other_i == 0) return -1;
        }
        else if (relRot == 2) {
            if (m18_j == 0 && m18_i == 0 && (other_j == 2 && other_i == 0 || other_j == 0 && other_i == 1)) return -1;
        }
        else if (relRot == 3) {
            if (m18_j == 0 && m18_i == 2 && other_j == 3 && other_i == 2) return -1;
        }
    }

    // --- REGRA E [18 \ 08] ---
    if (otherT == 8) {
        if (relRot == 0) {
            if (m18_j == 0 && m18_i == 0 && (other_j == 4 && other_i == 2 || other_j == 2 && other_i == 5)) return -1;
        }
        else if (relRot == 2) {
            if (m18_j == 0 && m18_i == 0 && (other_j == 4 && other_i == 0 || other_j == 3 && other_i == 0)) return -1;
        }
        else if (relRot == 3) {
            if (m18_j == 0 && m18_i == 2 && other_j == 5 && other_i == 2) return -1;
        }
    }

    // --- REGRA E [18 \ 09] ---
    if (otherT == 9) {
        if (relRot == 0) {
            if (m18_j == 0 && m18_i == 0 && (other_j == 5 && other_i == 2 || other_j == 4 && other_i == 3 || other_j == 3 && other_i == 4 || other_j == 2 && other_i == 7)) return -1;
        }
        else if (relRot == 1) {
            if (m18_j == 0 && m18_i == 2 && other_j == 4 && other_i == 0) return -1;
        }
        else if (relRot == 2) {
            if (m18_j == 0 && m18_i == 0 && (other_j == 5 && other_i == 0 || other_j == 3 && other_i == 1 || other_j == 0 && other_i == 4)) return -1;
        }
        else if (relRot == 3) {
            if (m18_j == 0 && m18_i == 2 && (other_j == 7 && other_i == 2 || other_j == 4 && other_i == 3 || other_j == 3 && other_i == 4)) return -1;
            if (m18_j == 1 && m18_i == 0 && other_j == 0 && other_i == 6) return 1;
            if (m18_j == 1 && m18_i == 2 && other_j == 2 && other_i == 7) return 1;
        }
    }

    // --- REGRA E [18 \ 10] ---
    if (otherT == 10) {
        if (relRot == 0) {
            if (m18_j == 0 && m18_i == 0 && (other_j == 7 && other_i == 2 || other_j == 6 && other_i == 2 || other_j == 5 && other_i == 3 || other_j == 4 && other_i == 4 || other_j == 3 && other_i == 5 || other_j == 2 && other_i == 9)) return -1;
        }
        else if (relRot == 1) {
            if (m18_j == 1 && m18_i == 0 && (other_j == 5 && other_i == 3 || other_j == 2 && other_i == 6)) return -1;
            if (m18_j == 0 && m18_i == 2 && (other_j == 4 && other_i == 1 || other_j == 1 && other_i == 4)) return -1;
        }
        else if (relRot == 2) {
            if (m18_j == 1 && m18_i == 2 && (other_j == 6 && other_i == 3 || other_j == 3 && other_i == 6)) return -1;
            if (m18_j == 0 && m18_i == 0 && (other_j == 7 && other_i == 0 || other_j == 6 && other_i == 0 || other_j == 4 && other_i == 1 || other_j == 3 && other_i == 2 || other_j == 1 && other_i == 4)) return -1;
        }
        else if (relRot == 3) {
            if (m18_j == 0 && m18_i == 2 && (other_j == 9 && other_i == 2 || other_j == 5 && other_i == 3 || other_j == 4 && other_i == 4 || other_j == 3 && other_i == 5)) return -1;
            if (m18_j == 1 && m18_i == 2 && other_j == 2 && other_i == 9) return 1;
        }
    }

    // --- REGRA E [18 \ 11] ---
    if (otherT == 11) {
        if (relRot == 0) {
            if (m18_j == 0 && m18_i == 0 && (other_j == 8 && other_i == 2 || other_j == 6 && other_i == 3 || other_j == 5 && other_i == 4 || other_j == 4 && other_i == 5 || other_j == 3 && other_i == 7 || other_j == 2 && other_i == 11)) return -1;
        }
        else if (relRot == 1) {
            if (m18_j == 0 && m18_i == 2 && (other_j == 5 && other_i == 1 || other_j == 4 && other_i == 2 || other_j == 3 && other_i == 3 || other_j == 2 && other_i == 4)) return -1;
        }
        else if (relRot == 2) {
            if (m18_j == 0 && m18_i == 0 && (other_j == 9 && other_i == 0 || other_j == 8 && other_i == 0 || other_j == 6 && other_i == 1 || other_j == 4 && other_i == 2 || other_j == 3 && other_i == 3 || other_j == 2 && other_i == 4 || other_j == 1 && other_i == 5 || other_j == 0 && other_i == 7)) return -1;
        }
        else if (relRot == 3) {
            if (m18_j == 0 && m18_i == 2 && (other_j == 11 && other_i == 2 || other_j == 7 && other_i == 3 || other_j == 5 && other_i == 4 || other_j == 4 && other_i == 5)) return -1;
            if (m18_j == 1 && m18_i == 2 && other_j == 2 && other_i == 11) return 1;
        }
    }

    // --- REGRA E [18 \ 12] ---
    if (otherT == 12) {
        if (relRot == 0) {
            if (m18_j == 0 && m18_i == 0 && (other_j == 3 && other_i == 2 || other_j == 4 && other_i == 9 || other_j == 3 && other_i == 9)) return -1;
        }
        else if (relRot == 1) {
            if (m18_j == 0 && m18_i == 0 && (other_j == 2 && other_i == 6 || other_j == 4 && other_i == 7)) return -1;
            if (m18_j == 0 && m18_i == 2 && (other_j == 2 && other_i == 0 || other_j == 1 && other_i == 1 || other_j == 0 && other_i == 2)) return -1;
        }
        else if (relRot == 2) {
            if (m18_j == 0 && m18_i == 2 && (other_j == 2 && other_i == 9 || other_j == 1 && other_i == 8 || other_j == 0 && other_i == 7)) return -1;
            if (m18_j == 0 && m18_i == 0 && (other_j == 2 && other_i == 0 || other_j == 1 && other_i == 1 || other_j == 0 && other_i == 2)) return -1;
        }
        else if (relRot == 3) {
            if (m18_j == 0 && m18_i == 2 && other_j == 4 && other_i == 2) return -1;
            if (m18_j == 0 && m18_i == 0 && (other_j == 2 && other_i == 9 || other_j == 1 && other_i == 8 || other_j == 0 && other_i == 7)) return -1;
        }
    }

    // --- REGRA E [18 \ 13] ---
    if (otherT == 13) {
        if (relRot == 0) {
            if ((m18_j == 1 && m18_i == 0 || m18_j == 0 && m18_i == 0) && other_j == 2 && other_i == 5) return -1;
        }
        else if (relRot == 1) {
            if (m18_j == 0 && m18_i == 0 && other_j == 2 && other_i == 3) return -1;
        }
        else if (relRot == 2) {
            if (m18_j == 0 && m18_i == 0 && other_j == 1 && other_i == 0) return -1;
        }
        else if (relRot == 3) {
            if (m18_j == 0 && m18_i == 0 && other_j == 0 && other_i == 4) return -1;
        }
    }

    // --- REGRA E [18 \ 16] ---
    if (otherT == 16) {
        if (c1 === 'B' && c2 === 'B') {
            if (relRot == 3 && m18_j == 1 && m18_i == 0 && (other_j == 1 && other_i == 0 || other_j == 0 && other_i == 1)) {
                return 1;
            }
            return -1;
        }
    }

    // --- REGRA E [18 \ 17] ---
    if (otherT == 17) {
        if (relRot == 1) {
            if (m18_j == 0 && m18_i == 2 && other_j == 0 && other_i == 0) return -1;
        }
        else if (relRot == 2) {
            if (m18_j == 0 && m18_i == 0 && other_j == 0 && other_i == 0) return -1;
            if (m18_j == 0 && m18_i == 2 && other_j == 0 && other_i == 2) return -1;
        }
        else if (relRot == 3) {
            if (m18_j == 1 && m18_i == 0 && other_j == 0 && other_i == 0) return -1;
            if (m18_j == 0 && m18_i == 2 && other_j == 1 && other_i == 2) return -1;
            if (m18_j == 0 && m18_i == 0 && other_j == 0 && other_i == 2) return -1;
        }
    }

    return 0;
}

function check19Override(t1, j1, i1, r1, c1, t2, j2, i2, r2, c2) {
    if (t1 !== 19 && t2 !== 19) return 0;

    var isT1_19 = (t1 == 19);
    var otherT = isT1_19 ? t2 : t1;

    var m19_j = isT1_19 ? j1 : j2;
    var m19_i = isT1_19 ? i1 : i2;
    var m19_r = isT1_19 ? r1 : r2;
    var m19_c = isT1_19 ? c1 : c2;

    var other_j = isT1_19 ? j2 : j1;
    var other_i = isT1_19 ? i2 : i1;
    var other_r = isT1_19 ? r2 : r1;
    var other_c = isT1_19 ? c2 : c1;

    var relRot = (m19_r - other_r + 4) % 4;

    // --- REGRAS 07 a 11 ---
    if (otherT == 7) {
        if (relRot == 0) { if (m19_j == 1 && m19_i == 2 && other_j == 3 && other_i == 0) return -1; }
        else if (relRot == 2) { if (m19_j == 1 && m19_i == 0 && other_j == 1 && other_i == 0) return 1; }
    }
    if (otherT == 8) {
        if (relRot == 0) { if (m19_j == 0 && m19_i == 2 && (other_j == 4 && other_i == 0 || other_j == 3 && other_i == 0)) return -1; }
        else if (relRot == 2) {
            if (m19_j == 0 && m19_i == 2 && other_j == 5 && other_i == 2) return 1;
            if (m19_j == 1 && m19_i == 0 && other_j == 2 && other_i == 0) return 1;
        }
    }
    if (otherT == 9) {
        if (relRot == 0) {
            if (m19_j == 1 && m19_i == 0 && other_j == 6 && other_i == 2) return -1;
            if (m19_j == 0 && m19_i == 2 && other_j == 5 && other_i == 0) return -1;
        }
        else if (relRot == 2) {
            if (m19_j == 0 && m19_i == 2 && other_j == 7 && other_i == 2) return 1;
            if (m19_j == 1 && m19_i == 0 && (other_j == 4 && other_i == 0 || other_j == 2 && other_i == 1)) return 1;
        }
    }
    if (otherT == 10) {
        if (relRot == 0) {
            if (m19_j == 1 && m19_i == 0 && (other_j == 8 && other_i == 2 || other_j == 7 && other_i == 2)) return -1;
            if (m19_j == 0 && m19_i == 2 && (other_j == 7 && other_i == 0 || other_j == 6 && other_i == 0)) return -1;
            if (m19_j == 0 && m19_i == 1 && other_j == 3 && other_i == 6) return -1;
        }
        else if (relRot == 1) { if (m19_j == 1 && m19_i == 0 && (other_j == 3 && other_i == 6 || other_j == 6 && other_i == 3)) return -1; }
        else if (relRot == 2) {
            if (m19_j == 0 && m19_i == 2 && other_j == 9 && other_i == 2) return 1;
            if (m19_j == 1 && m19_i == 0 && (other_j == 5 && other_i == 0 || other_j == 2 && other_i == 2)) return 1;
        }
    }
    if (otherT == 11) {
        if (relRot == 0) {
            if (m19_j == 1 && m19_i == 0 && (other_j == 10 && other_i == 2 || other_j == 9 && other_i == 2)) return -1;
            if (m19_j == 0 && m19_i == 2 && other_j == 8 && other_i == 0) return -1;
        }
        else if (relRot == 2) {
            if (m19_j == 0 && m19_i == 2 && other_j == 11 && other_i == 2) return 1;
            if (m19_j == 1 && m19_i == 0 && (other_j == 7 && other_i == 0 || other_j == 5 && other_i == 1)) return 1;
        }
    }

    // --- BLOCO ATUALIZADO E [19 \ 12] ---
    if (otherT == 12) {
        if (relRot == 0) {
            if (m19_j == 1 && m19_i == 0 && (other_j == 2 && other_i == 9 || other_j == 1 && other_i == 8 || other_j == 0 && other_i == 7)) return -1;
            if (m19_j == 0 && m19_i == 2 && (other_j == 3 && other_i == 7 || other_j == 4 && other_i == 7 || other_j == 2 && other_i == 0)) return -1;
        }
        else if (relRot == 1) { if (m19_j == 1 && m19_i == 0 && other_j == 2 && other_i == 5) return 1; }
        else if (relRot == 2) { if (m19_j == 0 && m19_i == 2 && other_j == 4 && other_i == 2) return 1; }
        else if (relRot == 3) { if (m19_j == 0 && m19_i == 2 && other_j == 2 && other_i == 5) return 1; }
    }

    // --- BLOCO ATUALIZADO E [19 \ 13] ---
    if (otherT == 13) {
        if (relRot == 0) {
            if (m19_j == 1 && m19_i == 0 && (other_j == 0 && other_i == 5 || other_j == 1 && other_i == 5)) return -1;
            if (m19_j == 0 && m19_i == 2 && other_j == 1 && other_i == 0) return -1;
            if (m19_j == 0 && m19_i == 0 && other_j == 2 && other_i == 5) return -1; // Nova restrição Azul no Verde adicionada aqui
        }
        else if (relRot == 1) { if (m19_j == 0 && m19_i == 2 && other_j == 0 && other_i == 5) return 1; }
        else if (relRot == 2) { if (m19_j == 1 && m19_i == 0 && other_j == 0 && other_i == 0) return 1; }
        else if (relRot == 3) { if (m19_j == 1 && m19_i == 0 && other_j == 0 && other_i == 5) return 1; }
    }

    // --- REGRAS RESTANTES ---
    if (otherT == 16) {
        if (m19_c === 'B' && other_c === 'B') { if (relRot == 0 || relRot == 2) return 1; return -1; }
        if (relRot == 0 && m19_j == 0 && m19_i == 2 && other_j == 1 && other_i == 0) return -1;
    }
    if (otherT == 17) {
        if (relRot == 0) { if (m19_j == 1 && m19_i == 0 && other_j == 0 && other_i == 2) return -1; }
        else if (relRot == 1) { if (m19_j == 1 && m19_i == 2 && other_j == 0 && other_i == 2) return -1; }
        else if (relRot == 2) { if (m19_j == 0 && m19_i == 2 && other_j == 1 && other_i == 2) return 1; }
        else if (relRot == 3) { if (m19_j == 0 && m19_i == 0 && other_j == 0 && other_i == 2) return -1; }
    }
    if (otherT == 18) {
        if (relRot == 0 && m19_c === 'G' && other_c === 'B') return -1;
        if (m19_c === 'B' && other_j == 0 && other_i == 2 && other_c === 'B') return -1;
    }
    if (otherT == 19) {
        if (relRot == 2) { if (m19_c === 'G' && other_c === 'B') return 1; if (m19_c === 'B' && other_c === 'G') return 1; }
    }

    return 0;
}

function check20Override(t1, j1, i1, r1, c1, t2, j2, i2, r2, c2) {
    if (t1 !== 20 && t2 !== 20) return 0;

    var isT1_20 = (t1 == 20);
    var otherT = isT1_20 ? t2 : t1;

    var m20_j = isT1_20 ? j1 : j2;
    var m20_i = isT1_20 ? i1 : i2;
    var m20_r = isT1_20 ? r1 : r2;
    var m20_c = isT1_20 ? c1 : c2;

    var other_j = isT1_20 ? j2 : j1;
    var other_i = isT1_20 ? i2 : i1;
    var other_r = isT1_20 ? r2 : r1;
    var other_c = isT1_20 ? c2 : c1;

    var relRot = (m20_r - other_r + 4) % 4;

    // --- REGRAS DO MÓDULO 20 COM O MÓDULO 20 (AUTO-COLISÃO) ---
    if (otherT == 20) {
        if (relRot == 0) {
            if ((j1 == 1 && i1 == 0 && j2 == 1 && i2 == 2) || (j2 == 1 && i2 == 0 && j1 == 1 && i1 == 2)) return 1;
            if ((j1 == 0 && i1 == 2 && j2 == 0 && i2 == 0) || (j2 == 0 && i2 == 2 && j1 == 0 && i1 == 0)) return 1;
        }
        else if (relRot == 2) {
            if ((j1 == 1 && i1 == 0 && j2 == 0 && i2 == 0) || (j2 == 1 && i2 == 0 && j1 == 0 && i1 == 0)) return 1;
            if ((j1 == 0 && i1 == 2 && j2 == 1 && i2 == 2) || (j2 == 0 && i2 == 2 && j1 == 1 && i1 == 2)) return 1;
        }
    }

    // --- REGRAS DO MÓDULO 20 COM O MÓDULO 07 ---
    if (otherT == 7) {
        if (relRot == 0) {
            if (m20_j == 1 && m20_i == 0 && other_j == 0 && other_i == 3) return -1;
            if (m20_j == 0 && m20_i == 2 && other_j == 3 && other_i == 0) return -1;
        }
        else if (relRot == 1) {
            if (m20_j == 1 && m20_i == 2 && other_j == 0 && other_i == 1) return 1;
        }
        else if (relRot == 3) {
            if (m20_j == 0 && m20_i == 0 && other_j == 0 && other_i == 1) return 1;
        }
    }

    // --- REGRAS DO MÓDULO 20 COM O MÓDULO 08 ---
    if (otherT == 8) {
        if (relRot == 0) {
            if (m20_j == 1 && m20_i == 0 && other_j == 0 && other_i == 5) return -1;
            if (m20_j == 0 && m20_i == 2 && other_j == 5 && other_i == 0) return -1;
        }
        else if (relRot == 1) {
            if (m20_j == 1 && m20_i == 2 && other_j == 0 && other_i == 2) return 1;
            if (m20_j == 0 && m20_i == 0 && other_j == 2 && other_i == 5) return 1;
        }
        else if (relRot == 3) {
            if (m20_j == 0 && m20_i == 0 && other_j == 0 && other_i == 2) return 1;
            if (m20_j == 1 && m20_i == 2 && other_j == 2 && other_i == 5) return 1;
        }
    }

    // --- REGRAS DO MÓDULO 20 COM O MÓDULO 09 ---
    if (otherT == 9) {
        if (relRot == 0) {
            if (m20_j == 1 && m20_i == 0 && other_j == 0 && other_i == 7) return -1;
            if (m20_j == 0 && m20_i == 2 && other_j == 7 && other_i == 0) return -1;
        }
        else if (relRot == 1) {
            if (m20_j == 1 && m20_i == 2 && (other_j == 0 && other_i == 4 || other_j == 1 && other_i == 2)) return 1;
            if (m20_j == 0 && m20_i == 0 && other_j == 2 && other_i == 7) return 1;
        }
        else if (relRot == 3) {
            if (m20_j == 0 && m20_i == 0 && (other_j == 0 && other_i == 4 || other_j == 1 && other_i == 2)) return 1;
            if (m20_j == 1 && m20_i == 2 && other_j == 2 && other_i == 7) return 1;
        }
    }

    // --- REGRAS DO MÓDULO 20 COM O MÓDULO 10 ---
    if (otherT == 10) {
        if (m20_c === 'Y' && (other_j == 6 && other_i == 3 || other_j == 3 && other_i == 6)) {
            return -1;
        }

        if (relRot == 0) {
            if (m20_j == 1 && m20_i == 0 && other_j == 0 && other_i == 9) return -1;
            if (m20_j == 0 && m20_i == 2 && other_j == 9 && other_i == 0) return -1;
        }
        else if (relRot == 1) {
            if (m20_j == 1 && m20_i == 2 && (other_j == 0 && other_i == 5 || other_j == 2 && other_i == 2)) return 1;
            if (m20_j == 0 && m20_i == 0 && other_j == 2 && other_i == 9) return 1;
        }
        else if (relRot == 3) {
            if (m20_j == 0 && m20_i == 0 && (other_j == 0 && other_i == 5 || other_j == 2 && other_i == 2)) return 1;
            if (m20_j == 1 && m20_i == 2 && other_j == 2 && other_i == 9) return 1;
        }
    }

    // --- REGRAS DO MÓDULO 20 COM O MÓDULO 11 ---
    if (otherT == 11) {
        if (relRot == 1) {
            if (m20_j == 1 && m20_i == 2 && (other_j == 0 && other_i == 7 || other_j == 1 && other_i == 5)) return 1;
            if (m20_j == 0 && m20_i == 0 && (other_j == 2 && other_i == 11 || other_j == 3 && other_i == 7)) return 1;
        }
        else if (relRot == 3) {
            if (m20_j == 0 && m20_i == 0 && (other_j == 0 && other_i == 7 || other_j == 1 && other_i == 5)) return 1;
            if (m20_j == 1 && m20_i == 2 && (other_j == 2 && other_i == 11 || other_j == 3 && other_i == 7)) return 1;
        }
    }

    // --- REGRAS DO MÓDULO 20 COM O MÓDULO 12 ---
    if (otherT == 12) {
        if (relRot == 0) {
            if (m20_j == 0 && m20_i == 2 && other_j == 4 && other_i == 0) return -1;
            if (m20_j == 1 && m20_i == 2 && other_j == 4 && other_i == 7) return 1;
        }
        else if (relRot == 1) {
            if (m20_j == 0 && m20_i == 0 && other_j == 2 && other_i == 4) return 1;
        }
        else if (relRot == 2) {
            if (m20_j == 0 && m20_i == 0 && other_j == 4 && other_i == 7) return 1;
        }
        else if (relRot == 3) {
            if (m20_j == 1 && m20_i == 2 && other_j == 2 && other_i == 4) return 1;
        }
    }

    // --- REGRAS DO MÓDULO 20 COM O MÓDULO 13 ---
    if (otherT == 13) {
        if (relRot == 0) {
            if (m20_j == 0 && m20_i == 2 && other_j == 2 && other_i == 0) return -1;
            if (m20_j == 0 && m20_i == 0 && other_j == 0 && other_i == 5) return 1;
        }
        else if (relRot == 1) {
            if (m20_j == 1 && m20_i == 2 && other_j == 0 && other_i == 0) return 1;
        }
        else if (relRot == 2) {
            if (m20_j == 1 && m20_i == 2 && other_j == 0 && other_i == 5) return 1;
        }
        else if (relRot == 3) {
            if (m20_j == 0 && m20_i == 0 && other_j == 0 && other_i == 0) return 1;
        }
    }

    // --- REGRAS DO MÓDULO 20 COM O MÓDULO 16 ---
    if (otherT == 16) {
        if (m20_c === 'B' && other_c === 'B') {
            if (relRot == 1 || relRot == 3) return 1;
            return -1;
        }
    }

    // --- REGRAS DO MÓDULO 20 COM O MÓDULO 17 ---
    if (otherT == 17) {
        if (relRot == 1) {
            if (m20_j == 0 && m20_i == 2 && other_j == 0 && other_i == 0) return -1;
        }
        else if (relRot == 3) {
            if (m20_j == 1 && m20_i == 0 && other_j == 0 && other_i == 0) return -1;
        }
    }

    // --- REGRAS DO MÓDULO 20 COM O MÓDULO 18 ---
    if (otherT == 18) {
        if (relRot == 0) {
            if (m20_j == 1 && m20_i == 2 && other_j == 1 && other_i == 0) return 1;
        }
        else if (relRot == 1) {
            if (m20_j == 0 && m20_i == 2 && other_j == 0 && other_i == 0) return -1;
        }
        else if (relRot == 2) {
            if (m20_j == 0 && m20_i == 0 && other_j == 1 && other_i == 0) return 1;
        }
        else if (relRot == 3) {
            if (m20_j == 1 && m20_i == 0 && other_j == 0 && other_i == 0) return -1;
        }
    }

    // --- REGRAS DO MÓDULO 20 COM O MÓDULO 19 ---
    if (otherT == 19) {
        if (relRot == 0) {
            if (m20_j == 1 && m20_i == 0 && other_j == 0 && other_i == 2) return -1;
            if (m20_j == 0 && m20_i == 2 && other_j == 1 && other_i == 0) return -1;
        }
    }

    return 0;
}

function checkColorCollision(type1, x1, y1, rot1, type2, x2, y2, rot2) {
    var v1 = getFillVectors(rot1);
    var v2 = getFillVectors(rot2);
    var dims1 = getModuleDims(type1);
    var dims2 = getModuleDims(type2);

    // --- FASE 1: ÂNCORAS GLOBAIS E BLOQUEIOS ---
    var global_bypass = false;
    for (var i1 = 0; i1 < dims1.len; i1++) {
        for (var j1 = 0; j1 < dims1.wid; j1++) {
            var worldX1 = x1 + (v1.p.x * i1) + (v1.s.x * j1);
            var worldY1 = y1 + (v1.p.y * i1) + (v1.s.y * j1);
            for (var i2 = 0; i2 < dims2.len; i2++) {
                for (var j2 = 0; j2 < dims2.wid; j2++) {
                    var worldX2 = x2 + (v2.p.x * i2) + (v2.s.x * j2);
                    var worldY2 = y2 + (v2.p.y * i2) + (v2.s.y * j2);

                    if (worldX1 === worldX2 && worldY1 === worldY2) {
                        var c1 = getModuleColor(type1, i1, j1);
                        var c2 = getModuleColor(type2, i2, j2);

                        var o13 = check13Override(type1, j1, i1, rot1, type2, j2, i2, rot2);
                        var o07 = check07Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o08 = check08Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o09 = check09Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o10 = check10Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o11 = check11Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o12 = check12Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o16 = check16Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o17 = check17Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o18 = check18Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o19 = check19Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o20 = check20Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2); // <-- LIGAÇÃO DO 20

                        if (o13 === -1 || o07 === -1 || o08 === -1 || o09 === -1 || o10 === -1 || o11 === -1 || o12 === -1 || o16 === -1 || o17 === -1 || o18 === -1 || o19 === -1 || o20 === -1) return false;
                        if (o13 === 2 || o07 === 2 || o08 === 2 || o09 === 2 || o10 === 2 || o11 === 2 || o12 === 2 || o16 === 2 || o17 === 2 || o18 === 2 || o19 === 2 || o20 === 2) global_bypass = true;
                    }
                }
            }
        }
    }

    if (global_bypass) return true;

    // --- FASE 2: VERIFICAÇÃO PIXEL A PIXEL PADRÃO ---
    for (var i1 = 0; i1 < dims1.len; i1++) {
        for (var j1 = 0; j1 < dims1.wid; j1++) {
            var worldX1 = x1 + (v1.p.x * i1) + (v1.s.x * j1);
            var worldY1 = y1 + (v1.p.y * i1) + (v1.s.y * j1);

            for (var i2 = 0; i2 < dims2.len; i2++) {
                for (var j2 = 0; j2 < dims2.wid; j2++) {
                    var worldX2 = x2 + (v2.p.x * i2) + (v2.s.x * j2);
                    var worldY2 = y2 + (v2.p.y * i2) + (v2.s.y * j2);

                    if (worldX1 === worldX2 && worldY1 === worldY2) {
                        var c1 = getModuleColor(type1, i1, j1);
                        var c2 = getModuleColor(type2, i2, j2);

                        if (c1 === 'R' || c2 === 'R') return false;

                        var o13 = check13Override(type1, j1, i1, rot1, type2, j2, i2, rot2);
                        var o07 = check07Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o08 = check08Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o09 = check09Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o10 = check10Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o11 = check11Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o12 = check12Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o16 = check16Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o17 = check17Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o18 = check18Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o19 = check19Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2);
                        var o20 = check20Override(type1, j1, i1, rot1, c1, type2, j2, i2, rot2, c2); // <-- LIGAÇÃO DO 20

                        var special_bypass = false;
                        if (o13 === 1 || o07 === 1 || o08 === 1 || o09 === 1 || o10 === 1 || o11 === 1 || o12 === 1 || o16 === 1 || o17 === 1 || o18 === 1 || o19 === 1 || o20 === 1) special_bypass = true;

                        if (!special_bypass) {
                            if (c1 === 'Y' && (c2 === 'Y' || c2 === 'B' || c2 === 'G')) return false;
                            if (c2 === 'Y' && (c1 === 'Y' || c1 === 'B' || c1 === 'G')) return false;
                        }

                        if (type1 == 12 && type2 == 12) {
                            if (j1 === 1 && i1 === 1 && j2 === 1 && i2 === 1) return false;
                            if (j1 === 1 && i1 === 8 && j2 === 1 && i2 === 8) return false;
                        }

                        var isG1_from_06 = (type1 == 6 && c1 === 'G');
                        var isG2_from_06 = (type2 == 6 && c2 === 'G');
                        var isG1_from_14 = (type1 == 14 && c1 === 'G');
                        var isG2_from_14 = (type2 == 14 && c2 === 'G');
                        var isG1_from_15 = (type1 == 15 && c1 === 'G');
                        var isG2_from_15 = (type2 == 15 && c2 === 'G');

                        if (isG1_from_14 && c2 !== 'T') {
                            if (isAllowed14(type2, j2, i2, j1, i1, rot2, rot1)) special_bypass = true;
                            else if (!special_bypass) return false;
                        }
                        if (isG2_from_14 && c1 !== 'T') {
                            if (isAllowed14(type1, j1, i1, j2, i2, rot1, rot2)) special_bypass = true;
                            else if (!special_bypass) return false;
                        }

                        if (isG1_from_15 && c2 !== 'T') {
                            if (isAllowed15(type2, j2, i2, j1, i1, rot2, rot1)) special_bypass = true;
                            else if (!special_bypass) return false;
                        }
                        if (isG2_from_15 && c1 !== 'T') {
                            if (isAllowed15(type1, j1, i1, j2, i2, rot1, rot2)) special_bypass = true;
                            else if (!special_bypass) return false;
                        }

                        if (isG1_from_06 && c2 !== 'T') {
                            var is_06_ok = false;
                            var relRot = (rot1 - rot2 + 4) % 4;

                            if (type2 == 8) {
                                if (relRot == 0 && j1 == 1 && i1 == 0 && j2 == 5 && i2 == 2) is_06_ok = true;
                                if (relRot == 0 && j1 == 0 && i1 == 1 && j2 == 2 && i2 == 5) is_06_ok = true;
                                if (relRot == 2 && (j1 == 1 && i1 == 0 || j1 == 0 && i1 == 1) && (j2 == 0 && i2 == 2 || j2 == 2 && i2 == 0)) is_06_ok = true;
                            }
                            else if (type2 == 9) {
                                if (relRot == 0 && j1 == 1 && i1 == 0 && j2 == 7 && i2 == 2) is_06_ok = true;
                                if (relRot == 0 && j1 == 0 && i1 == 1 && j2 == 2 && i2 == 7) is_06_ok = true;
                            }
                            else if (type2 == 10) {
                                if (relRot == 0 && j1 == 1 && i1 == 0 && (j2 == 9 && i2 == 2 || j2 == 6 && i2 == 3)) is_06_ok = true;
                                if (relRot == 0 && j1 == 0 && i1 == 1 && (j2 == 2 && i2 == 9 || j2 == 3 && i2 == 6)) is_06_ok = true;
                                if (relRot == 2 && (j1 == 1 && i1 == 0 || j1 == 0 && i1 == 1) && (j2 == 0 && i2 == 5 || j2 == 2 && i2 == 2 || j2 == 5 && i2 == 0)) is_06_ok = true;
                            }
                            else if (type2 == 11) {
                                if (relRot == 0 && j1 == 1 && i1 == 0 && j2 == 11 && i2 == 2) is_06_ok = true;
                                if (relRot == 0 && j1 == 0 && i1 == 1 && j2 == 2 && i2 == 11) is_06_ok = true;
                            }
                            else if (type2 == 12) {
                                if (relRot == 0 && j1 == 1 && i1 == 0 && j2 == 4 && i2 == 2) is_06_ok = true;
                                if (relRot == 0 && j1 == 0 && i1 == 1 && j2 == 2 && i2 == 4) is_06_ok = true;
                                if (relRot == 1 && j1 == 1 && i1 == 0 && j2 == 2 && i2 == 5) is_06_ok = true;
                                if (relRot == 1 && j1 == 0 && i1 == 1 && j2 == 4 && i2 == 7) is_06_ok = true;
                            }

                            if (is_06_ok) special_bypass = true;
                            else if (!special_bypass) return false;
                        }

                        if (isG2_from_06 && c1 !== 'T') {
                            var is_06_ok = false;
                            var relRot = (rot2 - rot1 + 4) % 4;

                            if (type1 == 8) {
                                if (relRot == 0 && j2 == 1 && i2 == 0 && j1 == 5 && i1 == 2) is_06_ok = true;
                                if (relRot == 0 && j2 == 0 && i2 == 1 && j1 == 2 && i1 == 5) is_06_ok = true;
                                if (relRot == 2 && (j2 == 1 && i2 == 0 || j2 == 0 && i2 == 1) && (j1 == 0 && i1 == 2 || j1 == 2 && i1 == 0)) is_06_ok = true;
                            }
                            else if (type1 == 9) {
                                if (relRot == 0 && j2 == 1 && i2 == 0 && j1 == 7 && i1 == 2) is_06_ok = true;
                                if (relRot == 0 && j2 == 0 && i2 == 1 && j1 == 2 && i1 == 7) is_06_ok = true;
                            }
                            else if (type1 == 10) {
                                if (relRot == 0 && j2 == 1 && i2 == 0 && (j1 == 9 && i1 == 2 || j1 == 6 && i1 == 3)) is_06_ok = true;
                                if (relRot == 0 && j2 == 0 && i2 == 1 && (j1 == 2 && i1 == 9 || j1 == 3 && i1 == 6)) is_06_ok = true;
                                if (relRot == 2 && (j2 == 1 && i2 == 0 || j2 == 0 && i2 == 1) && (j1 == 0 && i1 == 5 || j1 == 2 && i1 == 2 || j1 == 5 && i1 == 0)) is_06_ok = true;
                            }
                            else if (type1 == 11) {
                                if (relRot == 0 && j2 == 1 && i2 == 0 && j1 == 11 && i1 == 2) is_06_ok = true;
                                if (relRot == 0 && j2 == 0 && i2 == 1 && j1 == 2 && i1 == 11) is_06_ok = true;
                            }
                            else if (type1 == 12) {
                                if (relRot == 0 && j2 == 1 && i2 == 0 && j1 == 4 && i1 == 2) is_06_ok = true;
                                if (relRot == 0 && j2 == 0 && i2 == 1 && j1 == 2 && i1 == 4) is_06_ok = true;
                                if (relRot == 1 && j2 == 1 && i2 == 0 && j1 == 2 && i1 == 5) is_06_ok = true;
                                if (relRot == 1 && j2 == 0 && i2 == 1 && j1 == 4 && i1 == 7) is_06_ok = true;
                            }

                            if (is_06_ok) special_bypass = true;
                            else if (!special_bypass) return false;
                        }

                        if (c1 === 'G' && c2 === 'G') {
                            if (!special_bypass) return false;
                        }

                        if (!special_bypass) {
                            if ((c1 === 'G' && c2 === 'B') || (c2 === 'G' && c1 === 'B')) {
                                if (rot1 !== rot2) return false;
                            }
                        }
                    }
                }
            }
        }
    }
    return true;
}

function canPlaceTile(gx, gy, type, rot) {
    var dims = getModuleDims(type);
    var v = getFillVectors(rot);

    // 1. LIMITES DO ARTBOARD (Nova Restrição Rígida)
    var minX = artOffsetX;
    var maxX = artOffsetX + artW;
    var minY = artOffsetY;
    var maxY = artOffsetY + artH;

    for (var i = 0; i < dims.len; i++) {
        for (var j = 0; j < dims.wid; j++) {
            if (isCollisionException(type, i, j)) continue;
            var checkX = gx + (v.p.x * i) + (v.s.x * j);
            var checkY = gy + (v.p.y * i) + (v.s.y * j);

            // Se algum "pixel" da peça sair do quadrado branco, o clique é cancelado!
            if (checkX < minX || checkX >= maxX || checkY < minY || checkY >= maxY) {
                return false;
            }
        }
    }

    // Se o modo Free/Stencil estiver ligado, e passou a fronteira acima, permite!
    if (isOverlapMode) return true;

    // 2. TESTES DE COR E COLISÃO (O resto mantém-se)
    if (hasGeneticMap(type)) {
        for (var k = 0; k < placedObjects.length; k++) {
            var occupant = placedObjects[k];
            if (hasGeneticMap(occupant.type)) {
                if (isCurveGroup(type) && isCurveGroup(occupant.type)) {
                    var c1 = getCurveCenter(gx, gy, type, rot);
                    var c2 = getCurveCenter(occupant.x, occupant.y, occupant.type, occupant.rot);
                    if (c1.cx === c2.cx && c1.cy === c2.cy) continue;
                }
                if (!checkColorCollision(type, gx, gy, rot, occupant.type, occupant.x, occupant.y, occupant.rot)) {
                    return false;
                }
            }
        }
    }

    for (var i = 0; i < dims.len; i++) {
        for (var j = 0; j < dims.wid; j++) {
            var checkX = gx + (v.p.x * i) + (v.s.x * j);
            var checkY = gy + (v.p.y * i) + (v.s.y * j);

            if (isCollisionException(type, i, j)) continue;

            var occupants = collisionMap[checkX][checkY];
            if (occupants && occupants.length > 0) {
                for (var o = 0; o < occupants.length; o++) {
                    var occupant = occupants[o];
                    if (hasGeneticMap(type) && hasGeneticMap(occupant.type)) continue;

                    var isAllowed = false;
                    if (isCurveGroup(type) && isCurveGroup(occupant.type)) {
                        var c1 = getCurveCenter(gx, gy, type, rot);
                        var c2 = getCurveCenter(occupant.x, occupant.y, occupant.type, occupant.rot);
                        if (c1.cx === c2.cx && c1.cy === c2.cy) isAllowed = true;
                    }
                    if (!isAllowed) return false;
                }
            }
        }
    }
    return true;
}


function attemptSetTile(type) {
    var localX = mouseX - centerX;
    var localY = mouseY - centerY;
    var gridX = floor(localX / tileSize) + GRID_CX;
    var gridY = floor(localY / tileSize) + GRID_CY;

    if (gridX < 0 || gridX >= GRID_W || gridY < 0 || gridY >= GRID_H) return;

    for (var i = 0; i < placedObjects.length; i++) {
        var obj = placedObjects[i];
        if (obj.x == gridX && obj.y == gridY && obj.type == type && obj.rot == currentRotation) return;
    }

    var baseObj = { type: type, x: gridX, y: gridY, rot: currentRotation };
    var groupToTest = getMirroredGroup(baseObj);

    if (checkPlacementValidGroup(groupToTest)) {
        ultimaRecusa = '';
        saveHistory();
        for (var i = 0; i < groupToTest.length; i++) {
            placedObjects.push(groupToTest[i]);
            addObjToCollisionMap(groupToTest[i]);
        }
    } else {
        // Isto corre a cada frame com o rato premido: sem desduplicar, parar
        // um segundo em cima de uma peça valia 60 recusas. Só conta quando o
        // alvo muda — uma recusa por tentativa, não por frame.
        var alvo = gridX + ',' + gridY + ',' + type + ',' + currentRotation;
        if (alvo !== ultimaRecusa) { ultimaRecusa = alvo; acoes.recusas++; }
    }
}

function attemptDeleteTile() {
    var localX = mouseX - centerX;
    var localY = mouseY - centerY;
    var gridX = floor(localX / tileSize) + GRID_CX;
    var gridY = floor(localY / tileSize) + GRID_CY;

    if (gridX < 0 || gridX >= GRID_W || gridY < 0 || gridY >= GRID_H) return;

    var foundIndex = -1;
    for (var k = placedObjects.length - 1; k >= 0; k--) {
        if (doesObjectCover(placedObjects[k], gridX, gridY)) {
            foundIndex = k;
            break;
        }
    }

    if (foundIndex != -1) {
        var objToDelete = placedObjects[foundIndex];
        saveHistory();

        // Se clicou numa peça que já faz parte da seleção, apaga TODOS os selecionados
        var objectsToDelete = [];
        if (selectedObjects.includes(objToDelete)) {
            objectsToDelete = selectedObjects.slice();
        } else {
            objectsToDelete = [objToDelete];
        }

        for (var s = 0; s < objectsToDelete.length; s++) {
            var groupToDelete = getMirroredGroup(objectsToDelete[s]);

            for (var g = 0; g < groupToDelete.length; g++) {
                var m = groupToDelete[g];
                for (var j = placedObjects.length - 1; j >= 0; j--) {
                    var p = placedObjects[j];
                    if (p.type == m.type && p.x == m.x && p.y == m.y && p.rot == m.rot) {
                        placedObjects.splice(j, 1);
                        removeObjFromCollisionMap(p);
                        break;
                    }
                }
            }
        }
        selectedObjects = []; // Limpa a seleção depois de apagar
    }
}

function doesObjectCover(obj, targetX, targetY) {
    var dims = getModuleDims(obj.type);
    var v = getFillVectors(obj.rot);

    for (var i = 0; i < dims.len; i++) {
        for (var j = 0; j < dims.wid; j++) {
            var isHead = (i == 0 && j == 0);
            if (!isHead && isCollisionException(obj.type, i, j)) continue;
            var px = obj.x + (v.p.x * i) + (v.s.x * j);
            var py = obj.y + (v.p.y * i) + (v.s.y * j);
            if (px == targetX && py == targetY) return true;
        }
    }
    return false;
}

function getFillVectors(rot) {
    if (rot == 0) return { p: { x: 1, y: 0 }, s: { x: 0, y: 1 } };
    if (rot == 1) return { p: { x: 0, y: 1 }, s: { x: -1, y: 0 } };
    if (rot == 2) return { p: { x: -1, y: 0 }, s: { x: 0, y: -1 } };
    if (rot == 3) return { p: { x: 0, y: -1 }, s: { x: 1, y: 0 } };
    return { p: { x: 0, y: 0 }, s: { x: 0, y: 0 } };
}

function drawGrid() {
    // 0. OS LIMITES GLOBAIS SÃO AGORA LIDOS DIRETAMENTE
    var gridStartX = centerX + (artOffsetX - GRID_CX) * tileSize;
    var gridStartY = centerY + (artOffsetY - GRID_CY) * tileSize;
    var gridEndX = gridStartX + (artW * tileSize);
    var gridEndY = gridStartY + (artH * tileSize);
    var gridPixW = artW * tileSize;
    var gridPixH = artH * tileSize;

    // Fundo do Artboard (token bg/artboard = #f9f9f9)
    fill(249); noStroke(); rectMode(CORNER);
    rect(gridStartX, gridStartY, gridPixW, gridPixH);

    // Contorno cinza do Artboard
    push(); stroke(238); strokeWeight(0.75); noFill();
    rect(gridStartX, gridStartY, gridPixW, gridPixH); pop();

    // 1. Grelha Fina (Linhas ou Pontos)
    if (showSmallGrid) {
        push();
        if (currentGridStyle === 'lines') {
            strokeWeight(1); stroke(238); drawingContext.setLineDash([4, 4]);

            // As linhas só são desenhadas dentro da largura e altura do artboard (artW / artH)
            for (var i = 0; i <= artW; i++) {
                var px = gridStartX + (i * tileSize);
                line(px, gridStartY, px, gridEndY);
            }
            for (var j = 0; j <= artH; j++) {
                var py = gridStartY + (j * tileSize);
                line(gridStartX, py, gridEndX, py);
            }
        } else if (currentGridStyle === 'dots') {
            fill(238); noStroke(); // Cor do círculo

            // A tua matemática exata de escalonamento para 5.811pt
            var dotSize = tileSize * (5.811 / 15);

            // Limitado visualmente às fronteiras do Artboard ativo E ao ecrã (otimização de FPS)
            var startI = max(0, Math.floor((sidebarWidth - gridStartX) / tileSize));
            var endI = min(artW, Math.ceil((width - gridStartX) / tileSize));
            var startJ = max(0, Math.floor((topBarHeight - gridStartY) / tileSize));
            var endJ = min(artH, Math.ceil((height - gridStartY) / tileSize));

            for (var i = startI; i < endI; i++) {
                var px = gridStartX + (i * tileSize) + (tileSize / 2);
                for (var j = startJ; j < endJ; j++) {
                    var py = gridStartY + (j * tileSize) + (tileSize / 2);
                    ellipse(px, py, dotSize, dotSize);
                }
            }
        }
        pop();
    }

    // 2. GUIAS TIPOGRÁFICAS E LATERAIS
    if (showGuides && !modoCartaz) {
        var guideColors = {
            ascender: [220, 100, 150], capHeight: [180, 120, 200], xHeight: [100, 150, 220],
            baseline: [0, 200, 150], descender: [220, 150, 80], left: [255, 150, 0], right: [255, 150, 0]
        };
        var labels = {
            ascender: "ASCENDER", capHeight: "CAP HEIGHT", xHeight: "X-HEIGHT",
            baseline: "BASELINE", descender: "DESCENDER", left: "LEFT", right: "RIGHT"
        };

        for (var keyY in guidesY) {
            var screenY = centerY + (guidesY[keyY] - GRID_CY) * tileSize;
            var colY = guideColors[keyY];
            stroke(colY[0], colY[1], colY[2]); strokeWeight(0.75); drawingContext.setLineDash([8, 4]); line(sidebarWidth, screenY, width, screenY); drawingContext.setLineDash([]);
            noStroke(); fill(colY[0], colY[1], colY[2]); textAlign(LEFT, BOTTOM); textSize(9); text(labels[keyY], sidebarWidth + 10, screenY - 2);
        }

        for (var keyX in guidesX) {
            var screenX = centerX + (guidesX[keyX] - GRID_CX) * tileSize;
            var colX = guideColors[keyX];
            stroke(colX[0], colX[1], colX[2]); strokeWeight(0.75); drawingContext.setLineDash([8, 4]); line(screenX, topBarHeight, screenX, height); drawingContext.setLineDash([]);
            noStroke(); fill(colX[0], colX[1], colX[2]); textAlign(LEFT, TOP); textSize(9); text(labels[keyX], screenX + 5, topBarHeight + 10);
        }
    }

    if (showCenterV) { push(); stroke(200, 50, 255, 180); strokeWeight(0.75); drawingContext.setLineDash([10, 5]); line(centerX, topBarHeight, centerX, height); pop(); }
    if (showCenterH) { push(); stroke(200, 50, 255, 180); strokeWeight(0.75); drawingContext.setLineDash([10, 5]); line(sidebarWidth, centerY, width, centerY); pop(); }

    if (isMirrorModeV || isMirrorModeH) {
        stroke(255, 50, 50, 180); strokeWeight(0.75); drawingContext.setLineDash([5, 5]);
        if (isMirrorModeV) line(centerX, topBarHeight, centerX, height);
        if (isMirrorModeH) line(sidebarWidth, centerY, width, centerY);
        drawingContext.setLineDash([]);
        noStroke(); fill(255, 50, 50, 180); textSize(9);
        if (isMirrorModeV) { textAlign(LEFT, TOP); text("VERTICAL SYMMETRY", centerX + 10, topBarHeight + 15); }
        if (isMirrorModeH) { textAlign(RIGHT, BOTTOM); text("HORIZONTAL SYMMETRY", width - 15, centerY - 5); }
    }

    rectMode(CENTER);
}

// --- LETRA DE REFERÊNCIA (onion skin) -------------------------------------
// A parte difícil de um alfabeto não é desenhar uma letra, é a seguinte
// concordar com a primeira. Isto fixa uma letra já desenhada e mostra-a
// esbatida por baixo da atual, para se comparar hastes e larguras sem saltar
// de artboard. Fica em cinzento e não a preto: é referência, não desenho.
var shiftNoClique = false;   // Shift no momento do clique, lido do evento
var letraReferencia = null;
var ALPHA_REFERENCIA = 45;
var bufferReferencia = null;   // recriado quando a janela muda de tamanho

function desenharLetraReferencia() {
    if (!letraReferencia || letraReferencia === currentChar) return;
    var ref = storedCharacters[letraReferencia];
    if (!ref || !ref.objects || ref.objects.length === 0) return;

    // Desenha-se a letra opaca num buffer e só no fim se esbate tudo de uma vez.
    // Com alfa módulo a módulo, as sobreposições — possíveis em modo livre —
    // somavam-se e a referência ganhava manchas escuras que se liam como
    // densidade do desenho, que é precisamente o juízo que isto vem apoiar.
    if (!bufferReferencia || bufferReferencia.width !== width || bufferReferencia.height !== height) {
        bufferReferencia = createGraphics(width, height);
    }
    var g = bufferReferencia;
    g.clear();
    g.angleMode(DEGREES);            // o buffer tem o seu próprio estado
    g.imageMode(CENTER); g.rectMode(CENTER); g.noStroke();

    for (var k = 0; k < ref.objects.length; k++) {
        var obj = ref.objects[k];
        var cellCenterX = centerX + (obj.x - GRID_CX) * tileSize + tileSize / 2;
        var cellCenterY = centerY + (obj.y - GRID_CY) * tileSize + tileSize / 2;
        var dims = getModuleDims(obj.type);
        var offX = (dims.len - 1) * (tileSize / 2);
        var offY = (dims.wid - 1) * (tileSize / 2);

        g.push();
        g.translate(cellCenterX, cellCenterY);
        g.rotate(obj.rot * 90);
        if (modules[obj.type] && modules[obj.type].width > 1) {
            g.image(modules[obj.type], offX, offY, tileSize * dims.len, tileSize * dims.wid);
        } else {
            g.fill(150);
            g.rect(offX, offY, tileSize * dims.len, tileSize * dims.wid);
        }
        g.pop();
    }

    push();
    imageMode(CORNER);
    tint(255, ALPHA_REFERENCIA);     // esbate o conjunto, sem recolorir
    image(g, 0, 0);
    pop();
}

function drawModules() {
    for (var k = 0; k < placedObjects.length; k++) {
        var obj = placedObjects[k];
        var isSelected = selectedObjects.includes(obj);

        var cornerX = centerX + (obj.x - GRID_CX) * tileSize;
        var cornerY = centerY + (obj.y - GRID_CY) * tileSize;
        var cellCenterX = cornerX + tileSize / 2;
        var cellCenterY = cornerY + tileSize / 2;

        var dims = getModuleDims(obj.type);
        var offX = (dims.len - 1) * (tileSize / 2);
        var offY = (dims.wid - 1) * (tileSize / 2);

        push();
        translate(cellCenterX, cellCenterY);
        rotate(obj.rot * 90);

        if (isSelected && (selectedModule == -2 || selectedModule == -1)) {
            if (selectedModule == -1) {
                // BORRACHA - Ficam Vermelhos
                if (redModules[obj.type] && redModules[obj.type].width > 1) {
                    image(redModules[obj.type], offX, offY, tileSize * dims.len, tileSize * dims.wid);
                } else {
                    fill(255, 50, 50); noStroke();
                    rect(offX, offY, tileSize * dims.len, tileSize * dims.wid);
                }
            } else {
                // MOVER - Ficam Azuis
                if (blueModules[obj.type] && blueModules[obj.type].width > 1) {
                    image(blueModules[obj.type], offX, offY, tileSize * dims.len, tileSize * dims.wid);
                } else {
                    fill(0, 200, 0); noStroke();
                    rect(offX, offY, tileSize * dims.len, tileSize * dims.wid);
                }
            }
        } else {
            if (modules[obj.type] && modules[obj.type].width > 1) {
                image(modules[obj.type], offX, offY, tileSize * dims.len, tileSize * dims.wid);
            } else {
                fill(150); noStroke();
                rect(offX, offY, tileSize * dims.len, tileSize * dims.wid);
            }
        }
        pop();
    }
}

function drawCustomCursor() {
    if (interfaceBloqueada()) { cursor(ARROW); return; }
    if (showShortcutsModal) { cursor(ARROW); return; } // <-- ADICIONE ESTA LINHA AQUI!
    // A faixa da palavra é zona de leitura, não de desenho: sobre ela o rato
    // volta a ser um rato normal, sem fantasma do módulo por baixo.
    if (sobreFaixaPreview()) { cursor(ARROW); return; }

    if (mouseX > sidebarWidth && mouseY > topBarHeight) {

        // Cursor de Câmara atualizado para o Módulo -3
        if (keyIsDown(32) || mouseButton === CENTER || selectedModule === -3) {
            if (mouseIsPressed) cursor('grabbing');
            else cursor('grab');
            return;
        }

        var hGuide = getHoveredGuide();
        if (showGuides && (hGuide || draggedGuide)) {
            var currentGuide = draggedGuide || hGuide;
            if (currentGuide === 'left' || currentGuide === 'right') cursor('col-resize');
            else cursor('row-resize');
            return;
        }

        var localX = mouseX - centerX;
        var localY = mouseY - centerY;
        var gX = floor(localX / tileSize) + GRID_CX;
        var gY = floor(localY / tileSize) + GRID_CY;

        if (selectedModule == -2) {
            if (hoveringRotateHandle || isRotatingSelection) {
                cursor(isRotatingSelection ? 'grabbing' : 'grab');
                return;
            }
            if (isDraggingSelection) {
                noCursor();
                // ... (O código do fantasma a arrastar mantém-se igualzinho ao que já tinha aqui)
                var dx = gX - dragStartGrid.x;
                var dy = gY - dragStartGrid.y;
                var groupToTest = [];
                for (var i = 0; i < dragOriginals.length; i++) {
                    var o = dragOriginals[i];
                    var baseMoved = { type: o.type, x: o.x + dx, y: o.y + dy, rot: o.rot };
                    var mirroredBase = getMirroredGroup(baseMoved);
                    for (var m = 0; m < mirroredBase.length; m++) {
                        var isDup = false;
                        for (var j = 0; j < groupToTest.length; j++) {
                            if (groupToTest[j].type == mirroredBase[m].type && groupToTest[j].x == mirroredBase[m].x && groupToTest[j].y == mirroredBase[m].y && groupToTest[j].rot == mirroredBase[m].rot) {
                                isDup = true; break;
                            }
                        }
                        if (!isDup) groupToTest.push(mirroredBase[m]);
                    }
                }
                var allValid = checkPlacementValidGroup(groupToTest);
                for (var i = 0; i < groupToTest.length; i++) {
                    var ghost = groupToTest[i];
                    var gSnapX = centerX + (ghost.x - GRID_CX) * tileSize + (tileSize / 2);
                    var gSnapY = centerY + (ghost.y - GRID_CY) * tileSize + (tileSize / 2);
                    var dims = getModuleDims(ghost.type);
                    var offX = (dims.len - 1) * (tileSize / 2);
                    var offY = (dims.wid - 1) * (tileSize / 2);

                    push();
                    translate(gSnapX, gSnapY);
                    rotate(ghost.rot * 90);
                    if (allValid) {
                        tint(255, 180);
                        if (blueModules[ghost.type]) image(blueModules[ghost.type], offX, offY, tileSize * dims.len, tileSize * dims.wid);
                    } else {
                        tint(255, 180);
                        if (redModules[ghost.type]) image(redModules[ghost.type], offX, offY, tileSize * dims.len, tileSize * dims.wid);
                        else { fill(255, 50, 50, 180); noStroke(); rect(offX, offY, tileSize * dims.len, tileSize * dims.wid); }
                    }
                    pop();
                }
            } else if (!selectionBox.active) {
                var hIdx = findObjectAt(gX, gY);
                if (hIdx != -1) {
                    cursor('grab');
                    var hObj = placedObjects[hIdx];
                    var dims = getModuleDims(hObj.type);
                    var offX = (dims.len - 1) * (tileSize / 2);
                    var offY = (dims.wid - 1) * (tileSize / 2);
                    var cx = centerX + (hObj.x - GRID_CX) * tileSize + (tileSize / 2);
                    var cy = centerY + (hObj.y - GRID_CY) * tileSize + (tileSize / 2);

                    push();
                    translate(cx, cy);
                    rotate(hObj.rot * 90);
                    if (blueModules[hObj.type] && blueModules[hObj.type].width > 1) {
                        image(blueModules[hObj.type], offX, offY, tileSize * dims.len, tileSize * dims.wid);
                    }
                    pop();
                } else {
                    cursor(ARROW);
                }
            }
        } else if (selectedModule >= 0) {
            noCursor();
            var baseObj = { type: selectedModule, x: gX, y: gY, rot: currentRotation };
            var groupToTest = getMirroredGroup(baseObj);
            var overallValid = checkPlacementValidGroup(groupToTest);

            for (var i = 0; i < groupToTest.length; i++) {
                var ghost = groupToTest[i];
                var mSnapX = centerX + (ghost.x - GRID_CX) * tileSize + (tileSize / 2);
                var mSnapY = centerY + (ghost.y - GRID_CY) * tileSize + (tileSize / 2);
                var dims = getModuleDims(ghost.type);
                var offX = (dims.len - 1) * (tileSize / 2);
                var offY = (dims.wid - 1) * (tileSize / 2);

                push();
                translate(mSnapX, mSnapY);
                rotate(ghost.rot * 90);
                if (overallValid) {
                    tint(255, 127);
                    if (modules[ghost.type]) image(modules[ghost.type], offX, offY, tileSize * dims.len, tileSize * dims.wid);
                } else {
                    if (redModules[ghost.type]) image(redModules[ghost.type], offX, offY, tileSize * dims.len, tileSize * dims.wid);
                    else { fill(255, 0, 0); rect(offX, offY, tileSize * dims.len, tileSize * dims.wid); }
                }
                pop();
            }
        } else if (selectedModule == -1) {
            var hIdx = findObjectAt(gX, gY);
            if (hIdx != -1) {
                cursor(CROSS);
                var hObj = placedObjects[hIdx];
                var dims = getModuleDims(hObj.type);
                var offX = (dims.len - 1) * (tileSize / 2);
                var offY = (dims.wid - 1) * (tileSize / 2);
                var cx = centerX + (hObj.x - GRID_CX) * tileSize + (tileSize / 2);
                var cy = centerY + (hObj.y - GRID_CY) * tileSize + (tileSize / 2);

                push();
                translate(cx, cy);
                rotate(hObj.rot * 90);
                tint(255, 200);
                if (redModules[hObj.type] && redModules[hObj.type].width > 1) {
                    image(redModules[hObj.type], offX, offY, tileSize * dims.len, tileSize * dims.wid);
                } else {
                    fill(255, 50, 50, 200); noStroke();
                    rect(offX, offY, tileSize * dims.len, tileSize * dims.wid);
                }
                pop();
            } else {
                cursor(CROSS);
            }
        } else {
            cursor(ARROW);
        }
    } else {
        cursor(ARROW);
    }
}

function initAllCharacters() {
    for (var i = 0; i < characters.length; i++) {
        var char = characters[i];
        if (!storedCharacters[char]) {
            // Agora guardamos também o histórico do "Avançar"
            storedCharacters[char] = { objects: [], history: [], redoHistory: [] };
        }
    }
    if (!storedCharacters[CHAVE_CARTAZ]) {
        storedCharacters[CHAVE_CARTAZ] = { objects: [], history: [], redoHistory: [] };
    }
}

// Cabeçalho da barra lateral, onde vive o controlo de modo. Fica fora da zona
// com scroll, para não subir com o alfabeto.
var ALTURA_CABECALHO_MODO = 50;
function getSeletorModo() {
    var g = (typeof globalScale !== 'undefined') ? globalScale : 1;
    var gap = 45 * g, inicio = 30 * g, cSize = 34 * g;
    // Mesma largura e altura do bloco dos thumbnails: três colunas de ponta a
    // ponta. É a mesma expressão que os botões do rodapé usam, para os três
    // blocos da barra ficarem alinhados entre si.
    return { x: inicio + gap, y: topBarHeight + 25 * g,
             w: (2 * gap) + cSize, h: cSize };
}
function getCharTop() { return topBarHeight + ALTURA_CABECALHO_MODO * globalScale; }

// Alfabeto + cartaz. Usada onde interessa GRAVAR tudo; as contagens continuam a
// percorrer só `characters`.
function listaDeTelas() { return characters.concat([CHAVE_CARTAZ]); }

function definirModoCartaz(ligado) {
    if (modoCartaz === ligado) return;
    saveCharacter(currentChar);
    if (showWordPreview) fecharPreview();   // não faz sentido a compor palavras
    modoCartaz = ligado;
    if (ligado) {
        charAntesDoCartaz = currentChar;
        loadCharacter(CHAVE_CARTAZ);
    } else {
        loadCharacter(charAntesDoCartaz || 'A');
    }
    selectedObjects = [];
}

function saveHistory() {
    var hist = storedCharacters[currentChar].history;
    if (hist.length >= 15) hist.shift(); // Histórico aumentado para 15 passos
    var snapshot = JSON.parse(JSON.stringify(placedObjects));
    hist.push(snapshot);

    // Se o autor fizer algo novo, apaga o futuro (como num software real)
    storedCharacters[currentChar].redoHistory = [];
}

function undo() {
    if (typeof acoes !== 'undefined') acoes.undos++;
    var hist = storedCharacters[currentChar].history;
    var redoHist = storedCharacters[currentChar].redoHistory;

    if (hist.length > 0) {
        redoHist.push(JSON.parse(JSON.stringify(placedObjects))); // Guarda para o "Avançar"
        var previousState = hist.pop();
        placedObjects = JSON.parse(JSON.stringify(previousState));
        rebuildCollisionMap();
        saveCharacter(currentChar);
        selectedObjects = [];
    }
}

function redo() {
    var hist = storedCharacters[currentChar].history;
    var redoHist = storedCharacters[currentChar].redoHistory;

    if (redoHist.length > 0) {
        hist.push(JSON.parse(JSON.stringify(placedObjects))); // Guarda para o "Voltar"
        var nextState = redoHist.pop();
        placedObjects = JSON.parse(JSON.stringify(nextState));
        rebuildCollisionMap();
        saveCharacter(currentChar);
        selectedObjects = [];
    }
}

function saveCharacter(char) {
    if (!storedCharacters[char]) {
        storedCharacters[char] = { objects: [], history: [], redoHistory: [] };
    }
    storedCharacters[char].objects = JSON.parse(JSON.stringify(placedObjects));
}

function loadCharacter(char) {
    if (!storedCharacters[char]) initAllCharacters();
    placedObjects = JSON.parse(JSON.stringify(storedCharacters[char].objects));
    rebuildCollisionMap();
    currentChar = char;
    selectedObjects = [];
}

function switchCharacter(newChar) {
    if (newChar == currentChar) return;
    saveCharacter(currentChar);
    loadCharacter(newChar);
}

function isGridEmpty(char) {
    if (!storedCharacters[char]) return true;
    return storedCharacters[char].objects.length == 0;
}

// --- SISTEMA DE ESCALA E LIMITES GLOBAIS ---
var _cachedGlobalBounds = null;
var _cachedFrameBounds = -1;

// Caixa que contém uma lista de peças. O alfabeto partilha uma caixa comum,
// para todas as letras aparecerem à mesma escala nas miniaturas; o cartaz tem
// de usar a sua, senão é escalado pelas letras e transborda.
function boundsDosObjectos(listaDeObjs) {
    var minX = 0, maxX = 0, minY = 0, maxY = 0, hasContent = false;
    for (var i = 0; i < listaDeObjs.length; i++) {
        var objs = listaDeObjs[i];
        if (!objs || objs.length == 0) continue;
        for (var k = 0; k < objs.length; k++) {
            var o = objs[k];
            var dims = getModuleDims(o.type);
            var v = getFillVectors(o.rot);
            var p1x = o.x - GRID_CX;
            var p1y = o.y - GRID_CY;
            var p2x = p1x + (v.p.x * (dims.len - 1)) + (v.s.x * (dims.wid - 1));
            var p2y = p1y + (v.p.y * (dims.len - 1)) + (v.s.y * (dims.wid - 1));
            if (!hasContent) {
                minX = min(p1x, p2x); maxX = max(p1x, p2x);
                minY = min(p1y, p2y); maxY = max(p1y, p2y);
                hasContent = true;
            } else {
                minX = min(minX, p1x, p2x); maxX = max(maxX, p1x, p2x);
                minY = min(minY, p1y, p2y); maxY = max(maxY, p1y, p2y);
            }
        }
    }
    if (hasContent) { maxX += 1; maxY += 1; }
    return { minX: minX, maxX: maxX, minY: minY, maxY: maxY, hasContent: hasContent };
}

function getGlobalBounds() {
    // Re-calcula apenas 1 vez por frame para manter a plataforma rápida
    if (frameCount === _cachedFrameBounds && _cachedGlobalBounds) return _cachedGlobalBounds;

    var minX = 0, maxX = 0, minY = 0, maxY = 0;
    var hasContent = false;

    for (var i = 0; i < characters.length; i++) {
        var c = characters[i];
        var objs = (c == currentChar) ? placedObjects : (storedCharacters[c] ? storedCharacters[c].objects : []);
        if (!objs || objs.length == 0) continue;

        for (var k = 0; k < objs.length; k++) {
            var o = objs[k];
            var dims = getModuleDims(o.type);
            var v = getFillVectors(o.rot);

            // Mapear as distâncias ao centro (Baseline)
            var p1x = o.x - GRID_CX;
            var p1y = o.y - GRID_CY;
            var p2x = p1x + (v.p.x * (dims.len - 1)) + (v.s.x * (dims.wid - 1));
            var p2y = p1y + (v.p.y * (dims.len - 1)) + (v.s.y * (dims.wid - 1));

            if (!hasContent) {
                minX = min(p1x, p2x); maxX = max(p1x, p2x);
                minY = min(p1y, p2y); maxY = max(p1y, p2y);
                hasContent = true;
            } else {
                minX = min(minX, p1x, p2x); maxX = max(maxX, p1x, p2x);
                minY = min(minY, p1y, p2y); maxY = max(maxY, p1y, p2y);
            }
        }
    }

    if (hasContent) { maxX += 1; maxY += 1; }

    _cachedGlobalBounds = { minX: minX, maxX: maxX, minY: minY, maxY: maxY, hasContent: hasContent };
    _cachedFrameBounds = frameCount;
    return _cachedGlobalBounds;
}

// --- DESENHO DA MINIATURA ---
function drawThumbnail(char, x, y, size) {
    var objs = (char == currentChar) ? placedObjects : (storedCharacters[char] ? storedCharacters[char].objects : []);
    if (!objs || objs.length == 0) return;

    // O cartaz mede-se por si; as letras partilham a caixa do alfabeto para
    // aparecerem todas à mesma escala.
    var bounds = (char === CHAVE_CARTAZ) ? boundsDosObjectos([objs]) : getGlobalBounds();
    if (!bounds.hasContent) return;

    var bW = bounds.maxX - bounds.minX;
    var bH = bounds.maxY - bounds.minY;
    var maxDim = max(bW, bH);
    if (maxDim < 4) maxDim = 4;

    // 2. Aplica a escala com a margem de segurança que querias (30%)
    var marginFactor = 1.3;
    var miniSize = size / (maxDim * marginFactor);

    // 3. A MAGIA: Encontrar o centro visual do alfabeto inteiro
    var globalMidX = (bounds.minX + bounds.maxX) / 2;
    var globalMidY = (bounds.minY + bounds.maxY) / 2;

    var thumbCenterX = x + size / 2;
    var thumbCenterY = y + size / 2;

    // A linha de base é empurrada exatamente para o local onde as pernas cabem!
    var thumbnailBaselineY = thumbCenterY - (globalMidY * miniSize);
    var thumbnailCenterX = thumbCenterX - (globalMidX * miniSize);

    push();
    for (var k = 0; k < objs.length; k++) {
        var o = objs[k];
        var dims = getModuleDims(o.type);

        var cx = thumbnailCenterX + ((o.x - GRID_CX) * miniSize);
        var cy = thumbnailBaselineY + ((o.y - GRID_CY) * miniSize);

        var rectOffX = (dims.len - 1) * (miniSize / 2);
        var rectOffY = (dims.wid - 1) * (miniSize / 2);

        push();
        translate(cx, cy);
        rotate(o.rot * 90);
        imageMode(CENTER);

        if (modules[o.type] && modules[o.type].width > 1) {
            image(modules[o.type], rectOffX, rectOffY, dims.len * miniSize, dims.wid * miniSize);
        } else {
            fill(0); noStroke(); rectMode(CENTER);
            rect(rectOffX, rectOffY, dims.len * miniSize, dims.wid * miniSize);
        }
        pop();
    }
    pop();
}

function checkTopBarClick() {
    var tBoxSize = 34 * globalScale;
    var toolGapX = 45 * globalScale;
    var toolStartX = 30 * globalScale;
    var ty = 35 * globalScale;
    var my = 80 * globalScale;

    // 1. Clique Linha 1: Ferramentas
    for (var i = 0; i < 12; i++) {
        var tx = toolStartX + (i * toolGapX);
        if (mouseX > tx - tBoxSize / 2 && mouseX < tx + tBoxSize / 2 && mouseY > ty - tBoxSize / 2 && mouseY < ty + tBoxSize / 2) {
            if (i == 0) { selectedModule = -2; selectedObjects = []; return; }
            if (i == 1) { selectedModule = -1; selectedObjects = []; return; }
            if (i == 2) { selectedModule = -3; selectedObjects = []; return; }
            if (i == 3) { isMirrorModeV = !isMirrorModeV; return; }
            if (i == 4) { isMirrorModeH = !isMirrorModeH; return; }
            if (i == 5) { showSmallGrid = !showSmallGrid; return; }
            if (i == 6) { showCenterV = !showCenterV; return; }
            if (i == 7) { showCenterH = !showCenterH; return; }
            if (i == 8) { if (!modoCartaz) showGuides = !showGuides; return; }
            if (i == 9) { fitToScreen(); return; }
            if (i == 10) { undo(); return; }
            if (i == 11) { redo(); return; }
        }
    }

    // 1b. Setas de rotação (dentro da caixa do ângulo)
    if (dentroDe(btnRodarEsq)) { rodarPelasSetas(-1); return; }
    if (dentroDe(btnRodarDir)) { rodarPelasSetas(1); return; }

    // 2. Clique Linha 2: Módulos
    var ordemMods = ordemDosModulos();
    for (var pos = 0; pos < ordemMods.length; pos++) {
        var i = ordemMods[pos];
        var mx = toolStartX + (pos * toolGapX);
        if (mouseX > mx - tBoxSize / 2 && mouseX < mx + tBoxSize / 2 && mouseY > my - tBoxSize / 2 && mouseY < my + tBoxSize / 2) {
            selectedModule = i; currentRotation = 0; selectedObjects = []; return;
        }
    }

    // --- 3. CLIQUE LINHA 3: SEGMENTED CONTROLS ---
    var ly = 125 * globalScale;
    var styleBtnW = (3 * toolGapX) + tBoxSize;
    var styleBtnH = 34 * globalScale;

    var cxs = [
        toolStartX + (1.5 * toolGapX),
        toolStartX + (5.5 * toolGapX),
        toolStartX + (9.5 * toolGapX),
        toolStartX + (13.5 * toolGapX)
    ];

    if (mouseY > ly - styleBtnH / 2 && mouseY < ly + styleBtnH / 2) {
        // Tema [FILL | DOTTED]
        if (mouseX > cxs[0] - styleBtnW / 2 && mouseX < cxs[0] + styleBtnW / 2) {
            setVisualTheme(mouseX < cxs[0] ? 'fill' : 'dotted'); return;
        }
        // Grelha [LINES | DOTS]
        if (mouseX > cxs[1] - styleBtnW / 2 && mouseX < cxs[1] + styleBtnW / 2) {
            currentGridStyle = mouseX < cxs[1] ? 'lines' : 'dots'; return;
        }
        // Artboard [F1 | F2 | F3]
        if (mouseX > cxs[2] - styleBtnW / 2 && mouseX < cxs[2] + styleBtnW / 2) {
            var startX = cxs[2] - styleBtnW / 2;
            var segW = styleBtnW / 3;
            if (mouseX < startX + segW) currentArtboardIdx = 0;
            else if (mouseX < startX + 2 * segW) currentArtboardIdx = 1;
            else currentArtboardIdx = 2;
            updateArtboardBounds(); cleanupOutOfBoundsModules(); panX = 0; panY = 0; calculateLayout(); return;
        }
        // Orientação [PORTRAIT | LANDSCAPE]
        if (mouseX > cxs[3] - styleBtnW / 2 && mouseX < cxs[3] + styleBtnW / 2) {
            isLandscape = mouseX >= cxs[3];
            updateArtboardBounds(); cleanupOutOfBoundsModules(); panX = 0; panY = 0; calculateLayout(); return;
        }
    }

    // 4. Botões da Direita (Exportações)
    var rightMargin = width - (35 * globalScale);
    if (dentroDe(btnImport)) { fecharMenu(); importProjectJSON(); return; }
    if (dentroDe(btnClear)) {
        if (menuDeQuem === 'clear') { fecharMenu(); return; }
        abrirMenu('clear', itensLimpar(), btnClear.x + btnClear.w / 2, btnClear.y + btnClear.h / 2 + 6 * globalScale);
        return;
    }
    if (dentroDe(btnExport)) {
        if (menuDeQuem === 'export') { fecharMenu(); return; }
        abrirMenu('export', itensExportar(), btnExport.x + btnExport.w / 2, btnExport.y + btnExport.h / 2 + 6 * globalScale);
        return;
    }
}

function checkSidebarClick() {
    var charCols = 3;
    var charGapX = 45 * globalScale;
    var charStartX = 30 * globalScale;
    var charGapY = 45 * globalScale;
    var cSize = 34 * globalScale;
    var bottomPanelH = 150 * globalScale;

    // A mesma matemática de segurança
    var minSafeHeight = topBarHeight + bottomPanelH + (50 * globalScale);
    var effectiveBottom = max(height, minSafeHeight);

    // O thumbnail desenha-se a partir do centro: +18 põe o topo dele 9 abaixo
    // do controlo de modo, que é o mesmo intervalo usado entre os botões do
    // rodapé. Com menos, subia por cima do controlo.
    var charStartY = getCharTop() + 18 * globalScale - alphabetScrollY;
    if (modoCartaz) return;      // não há letras para clicar

    for (var i = 0; i < characters.length; i++) {
        var col = i % charCols;
        var row = floor(i / charCols);
        var x = charStartX + (col * charGapX);
        var y = charStartY + (row * charGapY);

        // Verificamos o clique respeitando a base virtual (effectiveBottom)
        if (mouseY > getCharTop() && mouseY < effectiveBottom - bottomPanelH) {
            if (mouseX > x - cSize / 2 && mouseX < x + cSize / 2 && mouseY > y - cSize / 2 && mouseY < y + cSize / 2) {
                // Shift fixa a letra como referência em vez de saltar para ela;
                // repetir no mesmo thumbnail solta-a.
                if (shiftNoClique) {
                    letraReferencia = (letraReferencia === characters[i]) ? null : characters[i];
                } else {
                    switchCharacter(characters[i]);
                }
                return;
            }
        }
    }
}

function drawUI() {
    var activeTooltip = null;
    var tooltipX = 0;
    var tooltipY = 0;

    // --- 1. BARRA SUPERIOR ---
    push(); fill(249); noStroke(); rectMode(CORNER); rect(0, 0, width, topBarHeight);
    stroke(238); strokeWeight(0.75); line(0, topBarHeight, width, topBarHeight); pop();

    var tBoxSize = 34 * globalScale;
    var toolGapX = 45 * globalScale;
    var toolStartX = 30 * globalScale;
    var ty = 35 * globalScale;
    var my = 80 * globalScale;

    // --- LINHA 1: FERRAMENTAS ---
    var toolsList = [
        { img: toolIcons.mover, active: selectedModule == -2, color: [0, 200, 0], tip: "Move / Select" },
        { img: toolIcons.limpar, active: selectedModule == -1, color: [255, 50, 50], tip: "Eraser" },
        { img: toolIcons.moverTela, active: selectedModule == -3, color: [200, 150, 0], tip: "Pan Camera" },
        { img: toolIcons.espelhoV, active: isMirrorModeV, color: [0, 200, 100], tip: "Vertical Symmetry" },
        { img: toolIcons.espelhoH, active: isMirrorModeH, color: [0, 200, 100], tip: "Horizontal Symmetry" },
        { img: toolIcons.grelhaMenor, active: showSmallGrid, color: [150, 150, 150], tip: "Toggle Grid" },
        { img: toolIcons.centroV, active: showCenterV, color: [150, 50, 255], tip: "Vertical Center" },
        { img: toolIcons.centroH, active: showCenterH, color: [150, 50, 255], tip: "Horizontal Center" },
        { img: toolIcons.guias, active: showGuides && !modoCartaz, color: [200, 100, 150], tip: "Typographic Guides", desativado: modoCartaz },
        { img: toolIcons.enquadrar, active: false, color: [100, 100, 100], tip: "Fit to Screen" },
        { img: toolIcons.voltar, active: false, color: [100, 100, 100], tip: "Undo" },
        { img: toolIcons.avancar, active: false, color: [100, 100, 100], tip: "Redo" }
    ];

    rectMode(CENTER); imageMode(CENTER);
    for (var i = 0; i < toolsList.length; i++) {
        var tx = toolStartX + (i * toolGapX);
        var t = toolsList[i];
        var isH = !t.desativado && (mouseX > tx - tBoxSize / 2 && mouseX < tx + tBoxSize / 2 && mouseY > ty - tBoxSize / 2 && mouseY < ty + tBoxSize / 2);
        if (isH) { activeTooltip = t.tip; tooltipX = tx; tooltipY = ty + tBoxSize / 2 + 15 * globalScale; }
        fill(t.desativado ? 252 : (t.active ? color(t.color[0], t.color[1], t.color[2], 30) : (isH ? 235 : 249)));
        stroke(t.desativado ? 246 : (t.active ? color(t.color[0], t.color[1], t.color[2]) : 238));
        strokeWeight(0.75); rect(tx, ty, tBoxSize, tBoxSize, 6 * globalScale);
        // Desativado: o ícone esmorece, para se ver que não está disponível.
        if (t.img) {
            if (t.desativado) tint(255, 55);   // opacidade, não cinzento
            else tint(t.active ? color(t.color[0], t.color[1], t.color[2]) : (isH ? 40 : 80));
            image(t.img, tx, ty, 20 * globalScale, 20 * globalScale); noTint();
        }
    }

    // --- SLIDER E ROTAÇÃO (LINHA 1) ---
    var sliderBoxCX = toolStartX + (14 * toolGapX);
    var sliderBoxW = (4 * toolGapX) + tBoxSize;

    // Hover calculado antes de desenhar a caixa, para ela poder reagir
    // como os restantes botões da barra (235 em hover, 249 normal).
    var isHoverSlider = !showShortcutsModal && (mouseX > uiSlider.x - 10 && mouseX < uiSlider.x + uiSlider.w + 10 && mouseY > ty - 15 && mouseY < ty + 15);

    fill(isHoverSlider || isDraggingSlider ? 235 : 249); stroke(238); strokeWeight(0.75);
    rect(sliderBoxCX, ty, sliderBoxW, tBoxSize, 6 * globalScale);

    // O NOSSO NOVO SLIDER DESENHADO EM JS VETORIAL
    var trackY = ty;
    // Fundo da Calha
    fill(208); noStroke(); rectMode(CENTER);
    rect(sliderBoxCX, trackY, uiSlider.w, 4 * globalScale, 2 * globalScale);

    // Onde a bolinha está agora (matemática exata)
    var thumbX = map(tileSize, uiSlider.min, uiSlider.max, uiSlider.x, uiSlider.x + uiSlider.w);
    var fillW = thumbX - uiSlider.x;

    // Calha preenchida de azul (da esquerda até à bolinha)
    if (fillW > 0) {
        rectMode(CORNER); fill(0, 200, 0);
        rect(uiSlider.x, trackY - 2 * globalScale, fillW, 4 * globalScale, 2 * globalScale);
        rectMode(CENTER);
    }

    // Bolinha
    fill(0, 200, 0);
    if (isHoverSlider || isDraggingSlider) { stroke(140, 225, 140); strokeWeight(0.75); } else { noStroke(); }
    circle(thumbX, trackY, 12 * globalScale);

    if (isHoverSlider || isDraggingSlider) {
        activeTooltip = "Scale: " + tileSize;
        tooltipX = sliderBoxCX; tooltipY = ty + tBoxSize / 2 + 15 * globalScale;
    }

    // A CAIXA DA ROTAÇÃO (Mantém-se igual)
    var rotBoxW = (2 * toolGapX) + tBoxSize;
    var rotBoxCX = toolStartX + (18 * toolGapX);
    fill(249); stroke(238); strokeWeight(0.75); rect(rotBoxCX, ty, rotBoxW, tBoxSize, 6 * globalScale);

    noStroke();
    // O indicador mostra o ângulo do que está prestes a ser afetado:
    // com um módulo escolhido, a rotação com que vai ser colocado;
    // com a ferramenta Mover, a rotação já aplicada à seleção.
    var anguloRot = null;
    if (selectedModule >= 0) {
        anguloRot = currentRotation * 90;
    } else if (selectedModule == -2 && selectedObjects.length > 0) {
        // Lido da própria peça (tal como o punho), para nunca divergirem
        anguloRot = ((((selectedObjects[0].rot % 4) + 4) % 4)) * 90;
    }

    // Setas de rodar, encostadas às pontas da caixa; o número fica ao centro.
    // As zonas de clique ficam guardadas para o checkTopBarClick as reutilizar.
    var setaTam = 18 * globalScale;
    var setaMargem = 12 * globalScale;
    btnRodarEsq.x = rotBoxCX - rotBoxW / 2 + setaMargem + setaTam / 2;
    btnRodarDir.x = rotBoxCX + rotBoxW / 2 - setaMargem - setaTam / 2;
    btnRodarEsq.y = btnRodarDir.y = ty;
    // O destaque do hover fica quadrado: a altura desenhada é tBoxSize-6, ou
    // seja 5 de folga acima e abaixo da seta. A largura acompanha, com os
    // mesmos 5 de cada lado, em vez dos 4 que tinha.
    btnRodarEsq.w = btnRodarDir.w = setaTam + 10 * globalScale;
    btnRodarEsq.h = btnRodarDir.h = tBoxSize;

    var podeRodar = (anguloRot !== null);
    var sobreEsq = podeRodar && !showShortcutsModal && dentroDe(btnRodarEsq);
    var sobreDir = podeRodar && !showShortcutsModal && dentroDe(btnRodarDir);

    // Fundo de destaque ao passar o rato, como nos restantes botões da barra
    if (sobreEsq || sobreDir) {
        push();
        noStroke(); fill(235); rectMode(CENTER);
        var alvo = sobreEsq ? btnRodarEsq : btnRodarDir;
        rect(alvo.x, alvo.y, alvo.w, alvo.h - 6 * globalScale, 5 * globalScale);
        pop();
    }

    if (toolIcons.rodarEsq) {
        tint(!podeRodar ? 205 : (sobreEsq ? color(0, 150, 0) : color(0, 200, 0)));
        image(toolIcons.rodarEsq, btnRodarEsq.x, ty, setaTam, setaTam);
        noTint();
    }
    if (toolIcons.rodarDir) {
        tint(!podeRodar ? 205 : (sobreDir ? color(0, 150, 0) : color(0, 200, 0)));
        image(toolIcons.rodarDir, btnRodarDir.x, ty, setaTam, setaTam);
        noTint();
    }

    fill(podeRodar ? [0, 200, 0] : 150); textAlign(CENTER, CENTER); textSize(11 * globalScale); textStyle(BOLD);
    text(podeRodar ? anguloRot + "º" : "--", rotBoxCX, ty);
    textStyle(NORMAL);

    if (sobreEsq) { activeTooltip = "Rotate left"; tooltipX = btnRodarEsq.x; tooltipY = ty + tBoxSize / 2 + 15 * globalScale; }
    if (sobreDir) { activeTooltip = "Rotate right"; tooltipX = btnRodarDir.x; tooltipY = ty + tBoxSize / 2 + 15 * globalScale; }

    // --- LINHA 2: MÓDULOS ---
    var ordemMods = ordemDosModulos();
    for (var pos = 0; pos < ordemMods.length; pos++) {
        var i = ordemMods[pos];
        var mx = toolStartX + (pos * toolGapX);
        var isH = (mouseX > mx - tBoxSize / 2 && mouseX < mx + tBoxSize / 2 && mouseY > my - tBoxSize / 2 && mouseY < my + tBoxSize / 2);
        if (isH) { activeTooltip = etiquetaDoModulo(i); tooltipX = mx; tooltipY = my + tBoxSize / 2 + 15 * globalScale; }
        fill(selectedModule == i ? [215, 245, 210] : (isH ? 235 : 249));
        stroke(selectedModule == i ? [0, 200, 0] : 238);
        strokeWeight(0.75); rect(mx, my, tBoxSize, tBoxSize, 6 * globalScale);
        var dims = getModuleDims(i); var maxD = max(dims.len, dims.wid);
        if (modules[i]) image(modules[i], mx, my, (dims.len / maxD) * (tBoxSize - 10), (dims.wid / maxD) * (tBoxSize - 10));
    }

    // --- LINHA 3: SEGMENTED CONTROLS ---
    var ly = 125 * globalScale;
    var styleBtnW = (3 * toolGapX) + tBoxSize;
    var styleBtnH = 34 * globalScale;

    var cx1 = toolStartX + (1.5 * toolGapX);
    var cx2 = toolStartX + (5.5 * toolGapX);
    var cx3 = toolStartX + (9.5 * toolGapX);
    var cx4 = toolStartX + (13.5 * toolGapX);

    drawSegmentedControl(cx1, ly, styleBtnW, styleBtnH, ["Fill", "Dot"], currentVisualTheme === 'fill' ? 0 : 1);
    drawSegmentedControl(cx2, ly, styleBtnW, styleBtnH, ["Line grid", "Dot grid"], currentGridStyle === 'lines' ? 0 : 1);
    drawSegmentedControl(cx3, ly, styleBtnW, styleBtnH, ["F1", "F2", "F3"], currentArtboardIdx);
    drawSegmentedControl(cx4, ly, styleBtnW, styleBtnH, ["Portrait", "Landscape"], isLandscape ? 1 : 0);

    if (mouseY > ly - styleBtnH / 2 && mouseY < ly + styleBtnH / 2 && !showShortcutsModal) {
        if (mouseX > cx3 - styleBtnW / 2 && mouseX < cx3 + styleBtnW / 2) {
            var segW = styleBtnW / 3;
            var startX = cx3 - styleBtnW / 2;
            if (mouseX < startX + segW) { activeTooltip = "Format 1 (690x990px)"; tooltipX = startX + segW / 2; tooltipY = ly + styleBtnH / 2 + 15 * globalScale; }
            else if (mouseX < startX + 2 * segW) { activeTooltip = "Format 2 (990x1410px)"; tooltipX = startX + 1.5 * segW; tooltipY = ly + styleBtnH / 2 + 15 * globalScale; }
            else { activeTooltip = "Format 3 (1410x1980px)"; tooltipX = startX + 2.5 * segW; tooltipY = ly + styleBtnH / 2 + 15 * globalScale; }
        }
    }

    // --- 4. BOTÕES DA DIREITA (DESENHO) ---
    var rightMargin = width - (35 * globalScale);
    // --- CANTO DIREITO: limpar, exportar e importar ---
    // Alinhados à direita do ecrã. Mas nunca mais perto do que 11 do conteúdo
    // à esquerda — o mesmo intervalo que separa dois módulos entre si. Quando
    // deixa de haver espaço, param de encolher a distância e encostam a esse
    // mínimo em vez de colarem aos módulos.
    var larguraMenu = 100 * globalScale;
    var fimDaPaleta = toolStartX + (modules.length - 1) * toolGapX + tBoxSize / 2;
    var fimDaLinha1 = toolStartX + (18 * toolGapX) + ((2 * toolGapX) + tBoxSize) / 2;
    var limiteEsquerdo = max(fimDaPaleta, fimDaLinha1) + 11 * globalScale;

    var esquerdaBotoes = max(width - 35 * globalScale + tBoxSize / 2 - larguraMenu, limiteEsquerdo);
    var bordaDir = esquerdaBotoes + larguraMenu;

    // Empilhados nas três linhas da barra, todos com a mesma forma. O Import
    // não leva seta: não abre menu, executa.
    btnClear.w = larguraMenu; btnClear.h = tBoxSize;
    btnClear.x = bordaDir - larguraMenu / 2; btnClear.y = ty;
    btnExport.w = larguraMenu; btnExport.h = tBoxSize;
    btnExport.x = bordaDir - larguraMenu / 2; btnExport.y = my;
    btnImport.w = larguraMenu; btnImport.h = tBoxSize;
    btnImport.x = bordaDir - larguraMenu / 2; btnImport.y = 125 * globalScale;

    desenharBotaoMenu(btnClear, 'Clear', menuDeQuem === 'clear', true, true);
    desenharBotaoMenu(btnExport, 'Export', menuDeQuem === 'export', false, true);
    desenharBotaoMenu(btnImport, 'Import', false, false, false);

    // --- BARRA LATERAL (ALFABETO EM SCROLL) ---
    fill(249); noStroke(); rectMode(CORNER); rect(0, topBarHeight, sidebarWidth, height - topBarHeight);
    var charGapY = 45 * globalScale; var cSize = 34 * globalScale; var bottomPanelH = 150 * globalScale;
    var minSafeHeight = topBarHeight + bottomPanelH + (50 * globalScale);
    var effectiveBottom = max(height, minSafeHeight);

    // CONTROLO DE MODO — cartaz ou alfabeto.
    // O push/pop não é decorativo: aqui o rectMode vem em CORNER do fundo da
    // barra, e o controlo desenha a contar com CENTER.
    var sm = getSeletorModo();
    push();
    rectMode(CENTER); textAlign(CENTER, CENTER);
    drawSegmentedControl(sm.x, sm.y, sm.w, sm.h, ['Alphabet', 'Poster'], modoCartaz ? 1 : 0);
    pop();

    var charTop = getCharTop();
    var availableHForChars = effectiveBottom - charTop - bottomPanelH;
    var charRows = Math.ceil(characters.length / 3);
    // A lista rola até revelar o botão da palavra, que fecha o alfabeto.
    var maxScroll = max(0, (charRows * charGapY + charGapY + 20 * globalScale) - availableHForChars);
    alphabetScrollY = constrain(alphabetScrollY, 0, maxScroll);
    var charStartY = charTop + 18 * globalScale - alphabetScrollY;

    // Em modo cartaz não há letras para escolher: a lista inteira desaparece.
    if (modoCartaz) { btnPreview.visivel = false; }

    push(); drawingContext.save(); drawingContext.beginPath(); drawingContext.rect(0, charTop, sidebarWidth, availableHForChars); drawingContext.clip();
    textSize(12 * globalScale); textStyle(NORMAL); rectMode(CENTER);
    for (var i = 0; !modoCartaz && i < characters.length; i++) {
        var col = i % 3; var row = floor(i / 3); var x = toolStartX + (col * toolGapX); var y = charStartY + (row * charGapY);
        if (y > charTop - cSize && y < effectiveBottom - bottomPanelH + cSize) {
            var isH = (mouseX > x - cSize / 2 && mouseX < x + cSize / 2 && mouseY > y - cSize / 2 && mouseY < y + cSize / 2 && mouseY > topBarHeight && mouseY < effectiveBottom - bottomPanelH);
            if (characters[i] == currentChar) { fill(220); stroke([0, 200, 0]); strokeWeight(0.75); } else if (characters[i] === letraReferencia) { fill(isH ? 235 : 249); stroke(120); strokeWeight(0.75); } else if (isH) { fill(235); stroke(238); strokeWeight(0.75); } else { fill(249); stroke(238); strokeWeight(0.75); }
            // Só aparece com Shift em baixo: o gesto explica-se no momento em
            // que se tenta, sem estar sempre a saltar durante o uso normal.
            if (isH && keyIsDown(SHIFT)) {   // a paira ainda não há evento de clique
                activeTooltip = (characters[i] === letraReferencia) ? 'Unpin reference letter' : 'Pin as reference letter';
                tooltipX = sidebarWidth + 90 * globalScale; tooltipY = y;
            }
            rect(x, y, cSize, cSize, 4 * globalScale);
            if (isGridEmpty(characters[i])) { noStroke(); fill(characters[i] == currentChar ? 0 : (isH ? 80 : 150)); text(characters[i], x, y); } else { drawThumbnail(characters[i], x - cSize / 2 + 2 * globalScale, y - cSize / 2 + 2 * globalScale, cSize - 4 * globalScale); }
        }
    }
    // BOTÃO DA PALAVRA: última coisa da lista, logo abaixo do 789. Como vive
    // dentro do recorte, rola com o alfabeto e só responde enquanto se vê.
    btnPreview.w = (2 * toolGapX) + cSize; btnPreview.h = 30 * globalScale;
    btnPreview.x = toolStartX + toolGapX;
    btnPreview.y = charStartY + charRows * charGapY;
    btnPreview.visivel = !modoCartaz &&
                         (btnPreview.y - btnPreview.h / 2 > charTop &&
                          btnPreview.y + btnPreview.h / 2 < effectiveBottom - bottomPanelH);

    var sobrePreview = !showShortcutsModal && btnPreview.visivel && dentroDe(btnPreview);
    push(); rectMode(CENTER);
    if (!modoCartaz) {
    fill(showWordPreview ? [220, 255, 220] : (sobrePreview ? 235 : 249));
    stroke(showWordPreview ? [0, 150, 0] : 238); strokeWeight(0.75);
    rect(btnPreview.x, btnPreview.y, btnPreview.w, btnPreview.h, 6 * globalScale);
    noStroke(); fill(showWordPreview ? [0, 150, 0] : (sobrePreview ? 80 : 150));
    textAlign(CENTER, CENTER); textSize(9.5 * globalScale); textStyle(BOLD);
    text('Preview word', btnPreview.x, btnPreview.y);
    }
    textStyle(NORMAL); pop();
    if (sobrePreview) {
        activeTooltip = "See your letters composed together";
        tooltipX = sidebarWidth + 80 * globalScale; tooltipY = btnPreview.y;
    }

    drawingContext.restore(); pop();

    // --- RODAPÉ FIXO DE CONFIGURAÇÕES ---
    fill(249); noStroke(); rectMode(CORNER); rect(0, effectiveBottom - bottomPanelH, sidebarWidth, bottomPanelH);
    stroke(238); strokeWeight(0.75); line(0, effectiveBottom - bottomPanelH, sidebarWidth, effectiveBottom - bottomPanelH);

    var btnW_largo = (2 * toolGapX) + cSize; var btnH = 34 * globalScale; var btnX_centro = toolStartX + toolGapX;

    // Posicionamento
    btnLetterpress.x = btnX_centro; btnLetterpress.y = effectiveBottom - 114 * globalScale; btnLetterpress.w = btnW_largo; btnLetterpress.h = btnH;
    btnStencil.x = btnX_centro; btnStencil.y = effectiveBottom - 71 * globalScale; btnStencil.w = btnW_largo; btnStencil.h = btnH;
    btnAtalhos.w = btnH; btnAtalhos.h = btnH; btnAtalhos.x = toolStartX; btnAtalhos.y = effectiveBottom - 25 * globalScale;
    btnFlip.w = btnH; btnFlip.h = btnH; btnFlip.x = toolStartX + toolGapX; btnFlip.y = effectiveBottom - 25 * globalScale;
    btnHome.w = btnH; btnHome.h = btnH; btnHome.x = toolStartX + 2 * toolGapX; btnHome.y = effectiveBottom - 25 * globalScale;

    textSize(9.5 * globalScale); textStyle(BOLD); rectMode(CENTER);

    var isOffH = (mouseX > btnLetterpress.x - btnLetterpress.w / 2 && mouseX < btnLetterpress.x + btnLetterpress.w / 2 && mouseY > btnLetterpress.y - btnLetterpress.h / 2 && mouseY < btnLetterpress.y + btnLetterpress.h / 2);
    fill(!isOverlapMode ? [0, 200, 0, 30] : (isOffH ? 235 : 249)); stroke(!isOverlapMode ? [0, 200, 0] : 238); strokeWeight(0.75);
    rect(btnLetterpress.x, btnLetterpress.y, btnLetterpress.w, btnLetterpress.h, 6 * globalScale);
    noStroke(); fill(!isOverlapMode ? [0, 200, 0] : 150); text("Letterpress mode", btnLetterpress.x, btnLetterpress.y);

    var isOnH = (mouseX > btnStencil.x - btnStencil.w / 2 && mouseX < btnStencil.x + btnStencil.w / 2 && mouseY > btnStencil.y - btnStencil.h / 2 && mouseY < btnStencil.y + btnStencil.h / 2);
    fill(isOverlapMode ? [0, 200, 0, 30] : (isOnH ? 235 : 249)); stroke(isOverlapMode ? [0, 200, 0] : 238); strokeWeight(0.75);
    rect(btnStencil.x, btnStencil.y, btnStencil.w, btnStencil.h, 6 * globalScale);
    noStroke(); fill(isOverlapMode ? [0, 200, 0] : 150); text("Free mode", btnStencil.x, btnStencil.y);

    var isAtH = !showShortcutsModal && (mouseX > btnAtalhos.x - btnAtalhos.w / 2 && mouseX < btnAtalhos.x + btnAtalhos.w / 2 && mouseY > btnAtalhos.y - btnAtalhos.h / 2 && mouseY < btnAtalhos.y + btnAtalhos.h / 2);
    fill(showShortcutsModal ? 220 : (isAtH ? 235 : 249)); stroke(showShortcutsModal ? [0, 200, 0] : 238); strokeWeight(0.75);
    rect(btnAtalhos.x, btnAtalhos.y, btnAtalhos.w, btnAtalhos.h, 6 * globalScale);
    if (toolIcons.atalhos) { tint(isAtH ? 40 : 80); image(toolIcons.atalhos, btnAtalhos.x, btnAtalhos.y, 20 * globalScale, 20 * globalScale); noTint(); }

    // BOTÃO FLIP (Espelhar)
    var isFlipH = !isOverlapMode && !showShortcutsModal && (mouseX > btnFlip.x - btnFlip.w / 2 && mouseX < btnFlip.x + btnFlip.w / 2 && mouseY > btnFlip.y - btnFlip.h / 2 && mouseY < btnFlip.y + btnFlip.h / 2);
    push();
    if (isOverlapMode) { fill(249, 249, 249, 150); stroke(238, 150); } // CORRIGIDO AQUI
    else { fill(isFlipH ? 235 : 249); stroke(238); }
    strokeWeight(0.75); rect(btnFlip.x, btnFlip.y, btnFlip.w, btnFlip.h, 6 * globalScale);
    noStroke(); fill(isOverlapMode ? 180 : 100); textAlign(CENTER, CENTER); textSize(9 * globalScale); textStyle(BOLD); text("FLIP", btnFlip.x, btnFlip.y);
    pop();

    // BOTÃO HOME (Voltar ao site) — seta desenhada à mão, sem SVG novo
    var isHomeH = !showShortcutsModal && (mouseX > btnHome.x - btnHome.w / 2 && mouseX < btnHome.x + btnHome.w / 2 && mouseY > btnHome.y - btnHome.h / 2 && mouseY < btnHome.y + btnHome.h / 2);
    push();
    fill(isHomeH ? 235 : 249); stroke(238); strokeWeight(0.75);
    rect(btnHome.x, btnHome.y, btnHome.w, btnHome.h, 6 * globalScale);
    stroke(isHomeH ? 40 : 100); strokeWeight(0.75); noFill();
    var aHalf = 5 * globalScale;
    var aHead = 4 * globalScale;
    line(btnHome.x + aHalf, btnHome.y, btnHome.x - aHalf, btnHome.y);
    line(btnHome.x - aHalf, btnHome.y, btnHome.x - aHalf + aHead, btnHome.y - aHead);
    line(btnHome.x - aHalf, btnHome.y, btnHome.x - aHalf + aHead, btnHome.y + aHead);
    pop();

    if (isOffH && isOverlapMode) { activeTooltip = "Activate"; tooltipX = sidebarWidth + 40 * globalScale; tooltipY = btnLetterpress.y; }
    if (isOnH && !isOverlapMode) { activeTooltip = "Activate"; tooltipX = sidebarWidth + 40 * globalScale; tooltipY = btnStencil.y; }
    if (isAtH) { activeTooltip = "Keyboard Shortcuts"; tooltipX = sidebarWidth + 70 * globalScale; tooltipY = btnAtalhos.y; }
    if (isFlipH && !isOverlapMode) { activeTooltip = "Flip Horizontal Composition"; tooltipX = sidebarWidth + 70 * globalScale; tooltipY = btnFlip.y; }
    if (isHomeH) { activeTooltip = "Back to pragmatipo.pt"; tooltipX = sidebarWidth + 70 * globalScale; tooltipY = btnHome.y; }

    stroke(238); strokeWeight(0.75); line(sidebarWidth, topBarHeight, sidebarWidth, effectiveBottom);

    if (activeTooltip && !showShortcutsModal) {
        push(); textSize(10 * globalScale); textStyle(NORMAL); var tw = textWidth(activeTooltip) + 16 * globalScale;
        tooltipX = constrain(tooltipX, tw / 2 + 10, width - tw / 2 - 10);
        rectMode(CENTER); fill(30, 230); noStroke(); rect(tooltipX, tooltipY, tw, 22 * globalScale, 4 * globalScale);
        fill(255); textAlign(CENTER, CENTER); text(activeTooltip, tooltipX, tooltipY); pop();
    }
}

// --- CONTEÚDO DO MANUAL (modal) ---
// h = secção, li = tópico, key = linha de atalho
var MANUAL = [
    { t: 'cat', s: 'Working modes' },

    { t: 'h', s: 'Letterpress mode' },
    { t: 'li', s: 'Simulates handling the movable-type version of the system: modules cannot overlap' },

    { t: 'h', s: 'Free mode' },
    { t: 'li', s: 'Simulates handling the stencil version of the system: modules can overlap' },

    { t: 'h', s: 'Flip' },
    { t: 'li', s: 'Available in letterpress mode only. Mirrors the letters, preparing them for printing with movable type' },
    { t: 'sc', k: 'H', s: 'Flip the entire composition' },

    { t: 'cat', s: 'Tools' },

    { t: 'h', s: 'Move / select', ic: 'mover' },
    { t: 'li', s: 'Move or select modules on the artboard' },
    { t: 'li', s: 'Select them one at a time, or several at once by dragging' },
    { t: 'li', s: 'Drag the handle above the selection to rotate it' },
    { t: 'sc', k: TECLA_CMD + ' + A', s: 'Select every module' },
    { t: 'sc', k: TECLA_CMD + ' + C', s: 'Copy the selection' },
    { t: 'sc', k: TECLA_CMD + ' + X', s: 'Cut the selection' },
    { t: 'sc', k: TECLA_CMD + ' + V', s: 'Paste at the pointer' },
    { t: 'sc', k: TECLA_CMD + ' + Shift + V', s: 'Paste in place (great across letters)' },
    { t: 'sc', k: TECLA_CMD + ' + D', s: 'Duplicate the selection in place' },
    { t: 'sc', k: 'Arrow keys', s: 'Nudge the selection one cell' },

    { t: 'h', s: 'Eraser', ic: 'limpar' },
    { t: 'li', s: 'Delete one or more modules on the artboard' },
    { t: 'li', s: 'Delete them one at a time, or several at once by dragging' },
    { t: 'sc', k: 'Delete / Backspace', s: 'Delete module or selection' },

    { t: 'h', s: 'Pan camera', ic: 'moverTela' },
    { t: 'li', s: 'Drag the artboard around' },
    { t: 'sc', k: 'Space + Drag', s: 'Pan the artboard' },
    { t: 'sc', k: 'C', s: 'Center the coordinates (0,0)' },

    { t: 'h', s: 'Vertical & horizontal symmetry', ic: ['espelhoV', 'espelhoH'] },
    { t: 'li', s: 'Speeds up drawing symmetrical letters \u2014 vertically, horizontally or on both axes \u2014 by mirroring every module automatically' },

    { t: 'h', s: 'Rotation' },
    { t: 'li', s: 'Shows the current rotation of the module' },
    { t: 'sc', k: 'R', s: 'Rotate the selected module' },

    { t: 'h', s: 'Undo', ic: 'voltar' },
    { t: 'li', s: 'Step back through the last 15 actions' },
    { t: 'sc', k: TECLA_CMD + ' + Z', s: 'Undo' },

    { t: 'h', s: 'Redo', ic: 'avancar' },
    { t: 'li', s: 'Step forward through the last 15 actions' },
    { t: 'sc', k: TECLA_CMD + ' + Shift + Z', s: 'Redo' },

    { t: 'cat', s: 'View & guides' },

    { t: 'h', s: 'Toggle grid', ic: 'grelhaMenor' },
    { t: 'li', s: 'Show or hide the grid' },
    { t: 'sc', k: 'G', s: 'Toggle grids on / off' },

    { t: 'h', s: 'Vertical center', ic: 'centroV' },
    { t: 'li', s: 'Show or hide a vertical guide line' },

    { t: 'h', s: 'Horizontal center', ic: 'centroH' },
    { t: 'li', s: 'Show or hide a horizontal guide line' },

    { t: 'h', s: 'Typographic guides', ic: 'guias' },
    { t: 'li', s: 'Show or hide the typographic guide lines' },
    { t: 'li', s: 'Their position carries across every artboard' },
    { t: 'li', s: 'Their order cannot be changed \u2014 except for the ascender and cap height, which may sometimes be swapped' },

    { t: 'h', s: 'Fit to screen', ic: 'enquadrar' },
    { t: 'li', s: 'Fit everything you have drawn into the visible area' },
    { t: 'sc', k: 'F', s: 'Fit the drawing to the window' },

    { t: 'h', s: 'Slider' },
    { t: 'li', s: 'Zoom in and out' },

    { t: 'h', s: 'Reference letter' },
    { t: 'li', s: 'Shift-click any letter in the side list to pin it. It is then drawn faded underneath whichever letter you are working on, so you can match stems and widths without jumping between artboards' },
    { t: 'li', s: 'Shift-click it again to unpin. The pinned letter is outlined in grey in the list, and stays pinned while you go through the alphabet' },

    { t: 'h', s: 'Reference ruler' },
    { t: 'li', s: 'The small box in the bottom-right corner shows the letter you are drawing at a reduced size' },
    { t: 'li', s: 'It is there to show how the drawing holds up small — something the magnified grid hides. It appears on its own once the artboard has modules' },

    { t: 'cat', s: 'Canvas & display' },

    { t: 'h', s: 'Fill / Dot' },
    { t: 'li', s: 'Fill: shows the modules fully filled in' },
    { t: 'li', s: 'Dot: shows the modules closer to the physical letterpress type' },

    { t: 'h', s: 'Line grid / Dot grid' },
    { t: 'li', s: 'Line grid: a grid closer to the stencil version of the system' },
    { t: 'li', s: 'Dot grid: a grid closer to the letterpress version of the system' },

    { t: 'h', s: 'F1 / F2 / F3' },
    { t: 'li', s: 'F1: close to 25 \u00d7 35 cm' },
    { t: 'li', s: 'F2: close to 35 \u00d7 50 cm' },
    { t: 'li', s: 'F3: close to 50 \u00d7 70 cm' },

    { t: 'h', s: 'Portrait / Landscape' },
    { t: 'li', s: 'Portrait: vertical artboard' },
    { t: 'li', s: 'Landscape: horizontal artboard' },

    { t: 'h', s: '36 side thumbnails' },
    { t: 'li', s: '26 of them correspond to the letters of the Latin alphabet; the remaining 10 to the digits' },

    { t: 'h', s: 'Preview word' },
    { t: 'li', s: 'Sits at the end of the thumbnail list. Opens a strip at the bottom of the screen where the letters you have drawn are set side by side' },
    { t: 'li', s: 'Type any letters in the box to compose them; the ones you have not drawn yet are skipped' },
    { t: 'li', s: 'The strip is not a dialog: the whole tool stays live above it, so editing a letter reshapes the word as you go. The letter you are editing is highlighted in the composition' },
    { t: 'sc', k: 'Arrow keys', s: 'Adjust the spacing between letters (pointer over the strip)' },
    { t: 'sc', k: 'Esc', s: 'Close the strip' },

    { t: 'cat', s: 'Projects & export' },

    { t: 'h', s: 'Import project', ic: 'importar' },
    { t: 'li', s: 'Import files previously exported from this tool' },
    { t: 'sc', k: 'Shift + O', s: 'Open project (JSON)' },

    { t: 'h', s: 'Save project', ic: 'guardar' },
    { t: 'li', s: 'Export a .json file so you can carry on exploring later' },
    { t: 'sc', k: 'Shift + S', s: 'Save project (JSON)' },

    { t: 'h', s: 'Export letter (SVG)', ic: 'exportarLetra' },
    { t: 'li', s: 'Export the selected artboard as an SVG file' },
    { t: 'sc', k: 'Shift + E', s: 'Export current letter (SVG)' },

    { t: 'h', s: 'Export alphabet (SVG)', ic: 'exportarAlfabeto' },
    { t: 'li', s: 'Export the whole alphabet as a single SVG file' },
    { t: 'sc', k: 'Shift + A', s: 'Export full alphabet (SVG)' },

    { t: 'h', s: 'Export alphabet (ZIP)', ic: 'exportarZip' },
    { t: 'li', s: 'Export the whole alphabet as separate SVG files inside a ZIP' },
    { t: 'sc', k: 'Shift + Z', s: 'Export ZIP file (individual letters)' },

    { t: 'h', s: 'Automatic saving' },
    { t: 'li', s: 'Your alphabet is kept in this browser as you work, so a crash or a tab closed by mistake does not cost you the session' },
    { t: 'li', s: 'It comes back on its own next time you open the tool, with a short note saying so' },
    { t: 'li', s: 'It is a safety net, not an archive: it lives in this browser only, and clearing the browser data erases it. To keep work for good, or to move it elsewhere, save the project as JSON' },

    { t: 'h', s: 'Back to pragmatipo.pt' },
    { t: 'li', s: 'Leaves the tool and returns to the site. If there is work that has never been saved to a file, it asks first' },

    { t: 'cat', s: 'Clearing' },

    { t: 'h', s: 'Clear artboard', ic: 'limparLetra', perigo: true },
    { t: 'li', s: 'Delete every module on the selected artboard' },

    { t: 'h', s: 'Clear alphabet', ic: 'limparAlfabeto', perigo: true },
    { t: 'li', s: 'Delete every module on every artboard' }
];

// Uma única fonte para as dimensões do modal, para o desenho e a deteção
// de cliques nunca divergirem.
function getModalBounds() {
    var w = min(640 * globalScale, width * 0.92);
    var h = min(760 * globalScale, height * 0.88);
    // headerH aqui para o desenho e a deteção de cliques usarem o mesmo valor
    return { w: w, h: h, x: width / 2, y: height / 2, headerH: 84 * globalScale };
}

// Parte uma frase em linhas que caibam na largura dada
function wrapText(str, maxW) {
    var palavras = str.split(' ');
    var linhas = [];
    var linha = '';
    for (var i = 0; i < palavras.length; i++) {
        var teste = linha ? linha + ' ' + palavras[i] : palavras[i];
        if (textWidth(teste) > maxW && linha) {
            linhas.push(linha);
            linha = palavras[i];
        } else {
            linha = teste;
        }
    }
    if (linha) linhas.push(linha);
    return linhas;
}

function drawShortcutsModal() {
    if (!showShortcutsModal) return;

    push();
    rectMode(CORNER); fill(0, 160); noStroke(); rect(0, 0, width, height);

    var b = getModalBounds();
    var left = b.x - b.w / 2, top = b.y - b.h / 2;
    var headerH = b.headerH;
    var padX = 32 * globalScale;

    rectMode(CENTER);
    fill(255); stroke(238); strokeWeight(0.75);
    rect(b.x, b.y, b.w, b.h, 16 * globalScale);

    // --- CONTEÚDO (recortado à área visível e deslocado pelo scroll) ---
    var areaTop = top + headerH;
    var areaH = b.h - headerH - 14 * globalScale;
    var colW = b.w - padX * 2;

    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(left, areaTop, b.w, areaH);
    drawingContext.clip();

    noStroke();
    rectMode(CORNER);
    imageMode(CORNER);
    var y = areaTop + 8 * globalScale - modalScrollY;

    // Coluna reservada aos ícones, à esquerda. O texto alinha todo a seguir,
    // mesmo nas secções sem ícone, para a lista não ficar aos degraus.
    var iconCol = 34 * globalScale;
    var textX = left + padX + iconCol;
    var textW = colW - iconCol;

    // Acordeão: cada categoria é um cabeçalho clicável; o conteúdo só desenha
    // quando a categoria está aberta. As áreas de clique são registadas em
    // coordenadas de ecrã para o mousePressed as poder testar.
    modalCatAreas = [];
    var categoriaAberta = false;

    for (var i = 0; i < MANUAL.length; i++) {
        var bloco = MANUAL[i];

        if (bloco.t === 'cat') {
            var aberta = !!categoriasAbertas[bloco.s];
            categoriaAberta = aberta;

            y += (i === 0 ? 4 : 16) * globalScale;
            var linhaTopo = y;
            var alturaCab = 42 * globalScale;

            // Realce ao passar o rato (só na área visível)
            var hoverCab = (mouseX > left + padX && mouseX < left + b.w - padX &&
                            mouseY > y && mouseY < y + alturaCab &&
                            mouseY > areaTop && mouseY < areaTop + areaH);
            if (hoverCab) {
                push(); rectMode(CORNER); noStroke(); fill(0, 0, 0, 8);
                rect(left + padX - 6 * globalScale, y, colW + 12 * globalScale, alturaCab, 6 * globalScale);
                pop();
            }

            // Seta ▸ (fechada) / ▾ (aberta)
            push();
            fill(0); textAlign(LEFT, CENTER); textStyle(BOLD);
            textSize(13 * globalScale);
            text(aberta ? '▾' : '▸', left + padX, y + alturaCab / 2);
            // Rótulo da categoria
            textSize(17 * globalScale);
            text(bloco.s, left + padX + 22 * globalScale, y + alturaCab / 2);
            textStyle(NORMAL);
            pop();

            // Regista a zona clicável desta categoria
            modalCatAreas.push({ nome: bloco.s, y0: linhaTopo, y1: linhaTopo + alturaCab });

            y += alturaCab;

            // Régua fina por baixo do cabeçalho
            stroke(238); strokeWeight(0.75);
            line(left + padX, y, left + b.w - padX, y);
            noStroke();
            y += 6 * globalScale;

        } else if (!categoriaAberta) {
            // Categoria fechada: salta o conteúdo sem o desenhar nem contar altura
            continue;

        } else if (bloco.t === 'h') {
            y += (i === 0 ? 6 : 18) * globalScale;

            // Ícone(s) da barra de ferramentas, para criar a associação visual.
            // Quando são dois (simetria V e H), ficam empilhados na vertical.
            var icones = bloco.ic ? ((typeof bloco.ic === 'string') ? [bloco.ic] : bloco.ic) : [];
            var empilhados = icones.length > 1;

            if (icones.length) {
                push();
                if (bloco.perigo) tint(255, 60, 60); else tint(30);
                if (empilhados) {
                    for (var q = 0; q < icones.length && q < 2; q++) {
                        var im2 = toolIcons[icones[q]];
                        if (im2) image(im2, left + padX,
                                       y - 3 * globalScale + q * 22 * globalScale,
                                       19 * globalScale, 19 * globalScale);
                    }
                } else {
                    var im = toolIcons[icones[0]];
                    if (im) image(im, left + padX, y - 3 * globalScale, 19 * globalScale, 19 * globalScale);
                }
                pop();
            }

            fill(0); textAlign(LEFT, TOP);
            textSize(14.5 * globalScale); textStyle(BOLD);
            text(bloco.s, textX, y);
            // O texto avança sempre igual: os ícones ficam numa coluna à
            // esquerda, por isso o segundo ícone empilhado não colide com nada.
            y += 23 * globalScale;
            textStyle(NORMAL);

        } else if (bloco.t === 'li') {
            textSize(13 * globalScale); textStyle(NORMAL);
            var linhas = wrapText(bloco.s, textW - 16 * globalScale);
            fill(150); textAlign(LEFT, TOP);
            text('•', textX, y);
            fill(90);
            for (var j = 0; j < linhas.length; j++) {
                text(linhas[j], textX + 16 * globalScale, y);
                y += 18 * globalScale;
            }
            y += 3 * globalScale;

        } else if (bloco.t === 'sc') {
            // Atalho junto da ferramenta a que pertence, com aspeto de tecla
            y += 4 * globalScale;
            textSize(11.5 * globalScale); textStyle(BOLD);
            var capW = textWidth(bloco.k) + 18 * globalScale;
            var capH = 20 * globalScale;

            push();
            rectMode(CORNER);
            fill(236, 250, 236); stroke(184, 224, 184); strokeWeight(0.75);
            rect(textX, y, capW, capH, 4 * globalScale);
            pop();

            noStroke();
            fill(0, 200, 0); textAlign(CENTER, CENTER);
            text(bloco.k, textX + capW / 2, y + capH / 2);

            textStyle(NORMAL); textSize(13 * globalScale);
            fill(90); textAlign(LEFT, CENTER);
            text(bloco.s, textX + capW + 10 * globalScale, y + capH / 2);
            y += capH + 7 * globalScale;
        }
    }

    var alturaTotal = (y + modalScrollY) - areaTop + 20 * globalScale;
    modalMaxScroll = max(0, alturaTotal - areaH);

    drawingContext.restore();

    // --- CABEÇALHO (por cima, para o conteúdo passar por baixo) ---
    noStroke(); rectMode(CORNER);
    // Cantos de cima arredondados para acompanharem a curva do painel — a
    // recto, os vértices brancos espreitavam por fora da borda arredondada.
    fill(255);
    rect(left + 2, top + 2, b.w - 4, headerH - 2,
         14 * globalScale, 14 * globalScale, 0, 0);
    fill(0); textAlign(LEFT, CENTER); textSize(30 * globalScale); textStyle(BOLD);
    text('Pragmatipo', left + padX, top + headerH / 2 - 11 * globalScale);
    textStyle(NORMAL); textSize(11 * globalScale); fill(140);
    text('Guide & keyboard shortcuts', left + padX, top + headerH / 2 + 20 * globalScale);
    stroke(238); strokeWeight(0.75); line(left + padX, top + headerH, left + b.w - padX, top + headerH);
    noStroke();

    // --- BARRA DE SCROLL ---
    if (modalMaxScroll > 0) {
        var trilhoX = left + b.w - 12 * globalScale;
        var trilhoH = areaH - 12 * globalScale;
        var trilhoY = areaTop + 6 * globalScale;
        fill(238); rectMode(CENTER);
        rect(trilhoX, trilhoY + trilhoH / 2, 4 * globalScale, trilhoH, 2 * globalScale);
        var puxadorH = max(30 * globalScale, trilhoH * (areaH / (areaH + modalMaxScroll)));
        var puxadorY = trilhoY + (trilhoH - puxadorH) * (modalScrollY / modalMaxScroll);
        fill(180);
        rect(trilhoX, puxadorY + puxadorH / 2, 4 * globalScale, puxadorH, 2 * globalScale);
    }

    // --- BOTÃO FECHAR ---
    rectMode(CENTER);
    var closeX = left + b.w - 30 * globalScale, closeY = top + 30 * globalScale;
    var isCloseHovered = dist(mouseX, mouseY, closeX, closeY) < 18 * globalScale;
    noStroke();
    fill(isCloseHovered ? color(255, 100, 100) : color(240));
    circle(closeX, closeY, 28 * globalScale);
    fill(isCloseHovered ? 255 : 150); textAlign(CENTER, CENTER); textSize(14 * globalScale);
    text('✕', closeX, closeY + 1 * globalScale);

    pop();
}

// --- TIPO DE LETRA DO SITE ---
// O canvas consegue usar qualquer fonte que o browser já tenha carregado,
// bastando pedi-la pelo nome. Mas o Cargo declara a fonte e só a descarrega
// quando há texto HTML que a use — nesta página é tudo canvas, por isso fica
// em 'unloaded' e o pedido seria ignorado em silêncio. Daí o fonts.load().
// Em localhost a fonte não existe: mantém-se o sans-serif por omissão.
var FONTE_DO_SITE = 'Marist Variable';
// A mesma família do manual, para os overlays em HTML. No localhost a Marist
// não existe e cai para a Helvetica, tal como o canvas já cai.
var PILHA_DE_FONTES = "'" + FONTE_DO_SITE + "', Helvetica, Arial, sans-serif";

function aplicarTipoDeLetraDoSite() {
    if (!document.fonts || !document.fonts.load) return;
    var pedido = '16px "' + FONTE_DO_SITE + '"';
    document.fonts.load(pedido).then(function () {
        if (fonteMesmoDisponivel(FONTE_DO_SITE)) textFont(FONTE_DO_SITE);
    }).catch(function () {
        // fonte indisponível (ex.: localhost) — fica a de omissão
    });
}

// O document.fonts.check() devolve true mesmo para fontes inexistentes (conta
// a de recurso como válida). A única forma fiável é medir: se o texto tem a
// mesma largura com e sem a fonte pedida, então ela não está lá.
function fonteMesmoDisponivel(familia) {
    var ctx = document.createElement('canvas').getContext('2d');
    var amostra = 'MWmwiI0Oo@#';
    ctx.font = '72px monospace';
    var larguraBase = ctx.measureText(amostra).width;
    ctx.font = '72px "' + familia + '", monospace';
    return ctx.measureText(amostra).width !== larguraBase;
}

// --- MOVER A SELEÇÃO COM AS SETAS -------------------------------------------
var ultimoNudge = 0;   // para não encher o histórico com cada toque na seta

function moverSelecao(dx, dy) {
    if (selectedObjects.length === 0) return false;

    // Uma rajada de setas conta como um só passo de undo
    var agora = millis();
    if (agora - ultimoNudge > 800) saveHistory();
    ultimoNudge = agora;

    var anteriores = selectedObjects.slice();
    for (var i = 0; i < anteriores.length; i++) {
        var idx = placedObjects.indexOf(anteriores[i]);
        if (idx > -1) placedObjects.splice(idx, 1);
        removeObjFromCollisionMap(anteriores[i]);
    }

    // Move e volta a gerar os espelhos, como faz o arrastar
    var movidos = [];
    for (var i = 0; i < anteriores.length; i++) {
        var o = anteriores[i];
        movidos.push({ type: o.type, x: o.x + dx, y: o.y + dy, rot: o.rot });
    }
    var completo = [];
    for (var k = 0; k < movidos.length; k++) {
        var ms = getMirroredGroup(movidos[k]);
        for (var m = 0; m < ms.length; m++) {
            if (!containsObj(completo, ms[m])) completo.push(ms[m]);
        }
    }

    if (checkPlacementValidGroup(completo)) {
        for (var i = 0; i < completo.length; i++) {
            placedObjects.push(completo[i]);
            addObjToCollisionMap(completo[i]);
        }
        selectedObjects = completo.slice(0, movidos.length);
        rotateOriginals = [];   // a base de rotação deixa de valer
        rotateStepsApplied = 0;
        return true;
    }

    // Não coube: repõe tudo onde estava
    for (var i = 0; i < anteriores.length; i++) {
        placedObjects.push(anteriores[i]);
        addObjToCollisionMap(anteriores[i]);
    }
    selectedObjects = anteriores;
    return false;
}

// Régua de referência: a letra atual em corpo pequeno, no canto. Serve para
// julgar como o desenho se comporta em tamanho reduzido — coisa que a grelha
// ampliada esconde.
// A contagem de módulos pousa por cima desta miniatura, por isso a geometria
// vive num sítio só — assim as duas não se desalinham.
function getReguaBounds() {
    var tam = 76 * globalScale;
    var margem = 14 * globalScale;
    var y = height - tam - margem - 18 * globalScale;
    // Numa janela baixa a régua sobe até entrar na barra de ferramentas.
    // Meia miniatura tapada é pior do que nenhuma, por isso desaparece.
    var cabe = (y - 6 * globalScale) > topBarHeight + 8 * globalScale;
    return { tam: tam,
             x: width - tam - margem,
             y: y,
             cabe: cabe,
             visivel: cabe && !showShortcutsModal && !showWordPreview && placedObjects.length > 0 };
}

function desenharReguaReferencia() {
    var r = getReguaBounds();
    if (!r.visivel) return;

    var tam = r.tam;
    var x = r.x;
    var y = r.y;

    push();
    rectMode(CORNER); noStroke();
    fill(249, 235);
    rect(x - 6 * globalScale, y - 6 * globalScale, tam + 12 * globalScale, tam + 12 * globalScale, 6 * globalScale);
    noFill(); stroke(238); strokeWeight(0.75);
    rect(x - 6 * globalScale, y - 6 * globalScale, tam + 12 * globalScale, tam + 12 * globalScale, 6 * globalScale);
    pop();

    drawThumbnail(currentChar, x, y, tam);
}

function selecionarTudo() {
    if (placedObjects.length === 0) return false;
    selectedObjects = placedObjects.slice();
    selectedModule = -2;      // ferramenta Mover, para se poder logo agir
    resetRotationBase();
    return true;
}

// --- PRÉ-VISUALIZAÇÃO DE PALAVRA -------------------------------------------
// Desenhar tipos é sobretudo julgar as letras EM CONJUNTO: ritmo, peso,
// consistência. Aqui compõem-se as letras já desenhadas, lado a lado.
var showWordPreview = false;
var previewText = '';
var previewSpacing = 1;      // células entre letras
var btnPreview = { x: 0, y: 0, w: 100, h: 34, visivel: false };

// Extensão horizontal e vertical de uma letra, em células
function limitesDaLetra(char) {
    var objs = (char === currentChar) ? placedObjects
             : (storedCharacters[char] ? storedCharacters[char].objects : []);
    if (!objs || objs.length === 0) return null;

    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (var k = 0; k < objs.length; k++) {
        var o = objs[k], d = getModuleDims(o.type), v = getFillVectors(o.rot);
        var cs = [{ i: 0, j: 0 }, { i: d.len - 1, j: 0 }, { i: 0, j: d.wid - 1 }, { i: d.len - 1, j: d.wid - 1 }];
        for (var c = 0; c < 4; c++) {
            var px = o.x + v.p.x * cs[c].i + v.s.x * cs[c].j;
            var py = o.y + v.p.y * cs[c].i + v.s.y * cs[c].j;
            if (px < minX) minX = px; if (px > maxX) maxX = px;
            if (py < minY) minY = py; if (py > maxY) maxY = py;
        }
    }
    return { objs: objs, minX: minX, maxX: maxX, minY: minY, maxY: maxY,
             larg: maxX - minX + 1, alt: maxY - minY + 1 };
}

// Onde cada letra do texto fica, em células, e a extensão total da linha
function composicaoDoTexto(texto) {
    var pecas = [], avanco = 0;
    var topo = 1e9, base = -1e9;

    for (var i = 0; i < texto.length; i++) {
        var ch = texto[i].toUpperCase();
        if (ch === ' ') { avanco += 4 + previewSpacing; continue; }

        var L = limitesDaLetra(ch);
        if (!L) continue;                       // letra por desenhar: salta
        pecas.push({ char: ch, L: L, x: avanco - L.minX });
        avanco += L.larg + previewSpacing;
        if (L.minY < topo) topo = L.minY;
        if (L.maxY > base) base = L.maxY;
    }
    if (pecas.length === 0) return null;
    return { pecas: pecas, larg: avanco - previewSpacing, topo: topo, base: base,
             alt: base - topo + 1 };
}

// Faixa fixa no fundo do ecrã. Não é modal: a ferramenta continua toda
// utilizável por cima, para se poder corrigir a letra e ver o efeito na
// palavra ao mesmo tempo.
function getPreviewBounds() {
    var h = min(210 * globalScale, height * 0.4);
    return { x: sidebarWidth, y: height - h, w: width - sidebarWidth, h: h,
             barraH: 44 * globalScale };
}

// --- CAMPO DE TEXTO ---------------------------------------------------------
// É um <input> HTML a sério, não texto desenhado. Assim o cursor, a seleção,
// o Cmd+A e o copiar/colar de texto funcionam como em qualquer caixa — e o
// Cmd+A deixa de apanhar os módulos do artboard.
var previewInput = null;

function garantirCampoPreview() {
    if (previewInput) return previewInput;
    var el = document.createElement('input');
    el.type = 'text';
    el.id = 'preview-word-input';
    el.setAttribute('placeholder', 'Type letters to test…');
    el.setAttribute('autocomplete', 'off');
    el.setAttribute('spellcheck', 'false');
    document.body.appendChild(el);
    el.addEventListener('input', function () { previewText = el.value; });
    // Esc devolve o teclado ao desenho sem fechar o painel
    el.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') { el.blur(); ev.stopPropagation(); }
    });
    previewInput = el;
    return el;
}

function previewInputTemFoco() {
    return !!previewInput && document.activeElement === previewInput;
}

// Posiciona e estiliza por JS — o Cargo esvazia CSS de <style>, como já vimos.
function posicionarCampoPreview() {
    var el = garantirCampoPreview();
    if (!showWordPreview) {
        el.style.setProperty('display', 'none', 'important');
        return;
    }
    var b = getPreviewBounds();
    var padX = 20 * globalScale;
    var alturaCampo = 26 * globalScale;

    var estilos = {
        'display': 'block',
        'position': 'fixed',
        'left': (b.x + padX) + 'px',
        'top': (b.y + (b.barraH - alturaCampo) / 2) + 'px',
        'width': min(380 * globalScale, b.w * 0.45) + 'px',
        'height': alturaCampo + 'px',
        'z-index': '9999',
        'font-size': (13 * globalScale) + 'px',
        'font-family': 'inherit',
        'font-weight': '700',
        'letter-spacing': '0.04em',
        'text-transform': 'uppercase',
        'color': '#323232',
        'background': '#ffffff',
        'border': '0.75px solid #eeeeee',
        'border-radius': (5 * globalScale) + 'px',
        'padding': '0 ' + (10 * globalScale) + 'px',
        'outline': 'none',
        'box-sizing': 'border-box',
        'margin': '0'
    };
    for (var k in estilos) el.style.setProperty(k, estilos[k], 'important');
}

function drawWordPreview() {
    posicionarCampoPreview();
    if (!showWordPreview) return;

    var b = getPreviewBounds();
    var padX = 20 * globalScale;

    push();
    // Faixa opaca no fundo — sem escurecer o resto, porque o resto continua a
    // ser utilizável enquanto se vê a palavra.
    rectMode(CORNER); noStroke();
    fill(249);
    rect(b.x, b.y, b.w, b.h);
    stroke(238); strokeWeight(0.75);
    line(b.x, b.y, b.x + b.w, b.y);
    line(b.x, b.y + b.barraH, b.x + b.w, b.y + b.barraH);
    noStroke();

    // --- BARRA DE CIMA: o campo de texto (HTML) vive aqui; à direita, ajustes
    var infoX = b.x + padX + min(380 * globalScale, b.w * 0.45) + 18 * globalScale;
    fill(150); textAlign(LEFT, CENTER); textSize(10 * globalScale); textStyle(NORMAL);
    text('spacing ' + previewSpacing + '  (\u2190 \u2192)', infoX, b.y + b.barraH / 2);

    // Botão fechar
    rectMode(CENTER);
    var fecharX = b.x + b.w - 24 * globalScale;
    var fecharY = b.y + b.barraH / 2;
    var sobreFechar = dist(mouseX, mouseY, fecharX, fecharY) < 15 * globalScale;
    noStroke();
    fill(sobreFechar ? color(255, 100, 100) : color(238));
    circle(fecharX, fecharY, 24 * globalScale);
    fill(sobreFechar ? 255 : 150); textAlign(CENTER, CENTER); textSize(12 * globalScale);
    text('\u2715', fecharX, fecharY + 1 * globalScale);

    // --- ÁREA DA PALAVRA ---
    var areaTop = b.y + b.barraH;
    var areaH = b.h - b.barraH;
    var areaW = b.w - padX * 2;

    var comp = composicaoDoTexto(previewText);
    if (!comp) {
        fill(190); textAlign(CENTER, CENTER); textSize(11.5 * globalScale);
        text(previewText.length ? 'None of those letters are drawn yet'
                                : 'Draw some letters, then type them above',
             b.x + b.w / 2, areaTop + areaH / 2);
        pop();
        return;
    }

    var esc = min(areaW / comp.larg, (areaH - 24 * globalScale) / (comp.alt + 1));
    esc = min(esc, 26 * globalScale);

    var totalW = comp.larg * esc;
    var x0 = b.x + b.w / 2 - totalW / 2;
    var y0 = areaTop + (areaH - comp.alt * esc) / 2 - comp.topo * esc;

    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(b.x, areaTop, b.w, areaH);
    drawingContext.clip();

    // linha de base como referência
    var baseY = y0 + guidesY.baseline * esc;
    if (baseY > areaTop && baseY < areaTop + areaH) {
        stroke(0, 200, 0, 55); strokeWeight(0.75);
        line(b.x + padX, baseY, b.x + b.w - padX, baseY);
        noStroke();
    }

    // A letra que se está a editar leva um realce por trás. Pintar os módulos
    // de verde não servia: tint() multiplica, e arte preta tingida fica preta.
    for (var q = 0; q < comp.pecas.length; q++) {
        if (comp.pecas[q].char !== currentChar) continue;
        var pq = comp.pecas[q], mg = 3 * globalScale;
        noStroke(); fill(0, 200, 0, 22); rectMode(CORNER);
        rect(x0 + (pq.L.minX + pq.x) * esc - mg, y0 + pq.L.minY * esc - mg,
             pq.L.larg * esc + mg * 2, (pq.L.maxY - pq.L.minY + 1) * esc + mg * 2,
             3 * globalScale);
    }

    imageMode(CENTER);
    for (var p = 0; p < comp.pecas.length; p++) {
        var pc = comp.pecas[p];
        for (var k = 0; k < pc.L.objs.length; k++) {
            var o = pc.L.objs[k];
            var dims = getModuleDims(o.type);
            var cx = x0 + (o.x + pc.x) * esc + esc / 2;
            var cy = y0 + o.y * esc + esc / 2;
            var offX = (dims.len - 1) * (esc / 2);
            var offY = (dims.wid - 1) * (esc / 2);

            push();
            translate(cx, cy);
            rotate(o.rot * 90);
            if (modules[o.type] && modules[o.type].width > 1) {
                image(modules[o.type], offX, offY, dims.len * esc, dims.wid * esc);
            } else {
                fill(0); noStroke(); rectMode(CENTER);
                rect(offX, offY, dims.len * esc, dims.wid * esc);
            }
            pop();
        }
    }
    drawingContext.restore();
    pop();
}

// O rato está sobre a faixa da pré-visualização?
function sobreFaixaPreview() {
    if (!showWordPreview) return false;
    var b = getPreviewBounds();
    return mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h;
}

// Abre com as letras que já existem, para haver logo algo a ver
function abrirPreview() {
    acoes.preview++;
    showWordPreview = true;
    if (previewText.length === 0) {
        var desenhadas = '';
        for (var i = 0; i < characters.length && desenhadas.length < 8; i++) {
            if (!isGridEmpty(characters[i])) desenhadas += characters[i];
        }
        previewText = desenhadas;
    }
    var el = garantirCampoPreview();
    el.value = previewText;
    posicionarCampoPreview();
    setTimeout(function () { el.focus(); el.select(); }, 0);
}

function fecharPreview() {
    showWordPreview = false;
    if (previewInput) { previewInput.blur(); posicionarCampoPreview(); }
}

// --- GUARDAR AUTOMATICAMENTE -----------------------------------------------
// A app vive só em memória: um crash, uma bateria a acabar ou um separador
// fechado por engano apagavam o alfabeto inteiro. Isto guarda o trabalho no
// browser e devolve-o na visita seguinte.
//
// Guarda apenas os desenhos, não o histórico de undo — são 15 cópias por letra
// e estoirariam o limite de espaço do browser sem grande proveito.
var CHAVE_AUTOSAVE = 'pragmatipo-trabalho';
var ultimaAssinatura = '';
var avisoRecuperado = 0;   // frames que falta mostrar a nota de recuperação
var autosaveOK = true;     // falso se o browser não deixar guardar (janela privada, espaço cheio)

// Impressão digital barata do estado: deteta peças acrescentadas, apagadas,
// movidas ou rodadas sem ter de serializar tudo a cada segundo.
function assinaturaDoTrabalho() {
    var s = currentArtboardIdx + (isLandscape ? 'L' : 'P');
    // O cartaz entra na assinatura, senão desenhar nele nunca disparava o
    // autosave. Fica fora das contagens, mas não fora da gravação.
    var telas = listaDeTelas();
    for (var i = 0; i < telas.length; i++) {
        var c = telas[i];
        var objs = (c === currentChar) ? placedObjects
                 : (storedCharacters[c] ? storedCharacters[c].objects : []);
        if (!objs || objs.length === 0) continue;
        var soma = 0;
        for (var k = 0; k < objs.length; k++) {
            soma += objs[k].x * 31 + objs[k].y * 17 + objs[k].rot * 7 + objs[k].type * 3;
        }
        s += '|' + c + objs.length + ',' + soma;
    }
    return s;
}

function guardarTrabalho() {
    try {
        var chars = {};
        var telas = listaDeTelas();
        for (var i = 0; i < telas.length; i++) {
            var c = telas[i];
            var objs = (c === currentChar) ? placedObjects
                     : (storedCharacters[c] ? storedCharacters[c].objects : []);
            if (objs && objs.length > 0) chars[c] = objs;
        }
        // Alfabeto vazio: apaga o registo em vez de guardar um vazio, para não
        // ressuscitar trabalho que a pessoa apagou de propósito.
        if (Object.keys(chars).length === 0) {
            localStorage.removeItem(CHAVE_AUTOSAVE);
            return;
        }
        localStorage.setItem(CHAVE_AUTOSAVE, JSON.stringify({
            v: 1,
            quando: Date.now(),
            artboard: currentArtboardIdx,
            landscape: isLandscape,
            letra: currentChar,
            letraAntesDoCartaz: charAntesDoCartaz,
            ref: letraReferencia,
            participante: participante ? participante.id : null,
            coorte: participante ? participante.coorte : null,
            chars: chars
        }));
        autosaveOK = true;
    } catch (e) {
        // Espaço esgotado ou localStorage bloqueado (janela privada). Deixa de
        // haver rede de segurança, por isso o aviso ao sair volta a fazer falta.
        autosaveOK = false;
    }
}

function recuperarTrabalho() {
    try {
        var bruto = localStorage.getItem(CHAVE_AUTOSAVE);
        if (!bruto) return false;
        var d = JSON.parse(bruto);
        if (!d || !d.chars || Object.keys(d.chars).length === 0) return false;

        for (var c in d.chars) {
            if (storedCharacters[c]) storedCharacters[c].objects = d.chars[c];
        }
        if (typeof d.artboard === 'number') currentArtboardIdx = d.artboard;
        if (typeof d.landscape === 'boolean') isLandscape = d.landscape;
        letraReferencia = (d.ref && storedCharacters[d.ref]) ? d.ref : null;
        updateArtboardBounds();

        var letra = (d.letra && storedCharacters[d.letra]) ? d.letra : 'A';

        // O modo é DERIVADO da tela que foi gravada, nunca guardado à parte.
        // Guardado à parte podiam divergir — e divergiam: ao gravar em modo
        // cartaz, a tela voltava com o cartaz mas a barra dizia "Alphabet".
        // Assim é impossível estarem em desacordo.
        modoCartaz = (letra === CHAVE_CARTAZ);
        charAntesDoCartaz = (d.letraAntesDoCartaz && storedCharacters[d.letraAntesDoCartaz]
                             && d.letraAntesDoCartaz !== CHAVE_CARTAZ)
                          ? d.letraAntesDoCartaz : 'A';

        loadCharacter(letra);
        return true;
    } catch (e) {
        return false;
    }
}

// Chamado a cada frame; só escreve quando algo mudou de facto, e no máximo
// uma vez por segundo, para não pesar no desenho.
function verificarAutosave() {
    if (frameCount % 60 !== 0) return;
    var a = assinaturaDoTrabalho();
    if (a === ultimaAssinatura) return;
    ultimaAssinatura = a;
    guardarTrabalho();
    registarActividade();
}

// Nota discreta a dizer que o trabalho anterior foi devolvido. Desvanece
// sozinha — não é um alerta, só uma explicação para o desenho já lá estar.
function desenharAvisoRecuperado() {
    if (avisoRecuperado <= 0) return;
    avisoRecuperado--;
    if (showShortcutsModal) return;   // como a contagem: não flutua sobre o manual

    var opacidade = min(255, avisoRecuperado * 4);   // desvanece no fim
    var texto = 'Work recovered from your last session';
    var meiaAltura = 14 * globalScale;
    // Ao centro, em baixo: é uma nota sobre o desenho todo, não sobre um canto.
    var base = showWordPreview ? getPreviewBounds().y : height;
    var cy = base - meiaAltura - 22 * globalScale;
    if (cy - meiaAltura < topBarHeight + 8 * globalScale) return;   // não cabe
    desenharPilula(texto, width / 2, cy,
                   [0, 200, 0, opacidade * 0.12], [0, 150, 0, opacidade]);
}

// Formato comum das notas flutuantes: cápsula com fundo suave e texto ao
// centro. Partilhado para a contagem e o aviso ficarem visualmente irmãos.
function desenharPilula(texto, cx, cy, corFundo, corTexto, opcoes) {
    opcoes = opcoes || {};
    push();
    textSize(11 * globalScale); textStyle(NORMAL); textAlign(CENTER, CENTER);
    var largura = max(textWidth(texto) + 24 * globalScale, opcoes.largura || 0);
    var altura = 28 * globalScale;
    rectMode(CENTER);
    if (opcoes.contorno) { stroke(opcoes.contorno); strokeWeight(0.75); } else noStroke();
    fill(corFundo);
    rect(cx, cy, largura, altura, 6 * globalScale);
    noStroke(); fill(corTexto);
    text(texto, cx, cy);
    pop();
    return { w: largura, h: altura };
}

// Abre o manual só na primeira vez que cada pessoa entra na plataforma.
// Nas visitas seguintes fica fechado; o botão de atalhos abre-o sempre.
function mostrarManualNaPrimeiraVisita() {
    var chave = 'pragmatipo-manual-visto';
    try {
        if (localStorage.getItem(chave)) return; // já cá esteve
        localStorage.setItem(chave, '1');
    } catch (e) {
        // localStorage bloqueado (navegação privada): mostra na mesma
    }
    abrirManual();
}

// Abre o manual sempre como índice limpo: scroll no topo e categorias fechadas.
function abrirManual() {
    showShortcutsModal = true;
    modalScrollY = 0;
    categoriasAbertas = {};
}

function keyPressed(event) {
    // Atalhos do sistema (Cmd+R recarregar, Cmd+S guardar página...) passam
    // intactos: sem isto, um Cmd+R rodava a peça E recarregava a página.
    // O Cmd+C/Cmd+V é tratado à parte, num listener próprio — ver mais abaixo.
    if (event && (event.metaKey || event.ctrlKey)) return;

    // Com o cursor dentro da caixa de texto, o teclado é todo dela: escrever
    if (interfaceBloqueada()) return;
    // "r" escreve um r, e o Cmd+A seleciona o texto — não os módulos.
    if (previewInputTemFoco()) return;

    // Faixa aberta, mas a escrever fora dela: as setas afinam o espaçamento
    // enquanto o rato estiver sobre a faixa; ESC fecha-a.
    if (showWordPreview) {
        if (keyCode === ESCAPE) { fecharPreview(); return false; }
        if (sobreFaixaPreview()) {
            if (keyCode === LEFT_ARROW) { previewSpacing = max(0, previewSpacing - 1); return false; }
            if (keyCode === RIGHT_ARROW) { previewSpacing = min(12, previewSpacing + 1); return false; }
        }
    }

    // Com o manual aberto, as teclas não devem mexer no desenho por trás dele
    if (showShortcutsModal) {
        if (keyCode === ESCAPE) showShortcutsModal = false;
        return;
    }

    if (key == 'c' || key == 'C') { panX = 0; panY = 0; calculateLayout(); }

    // NOVO ATALHO DE ESPELHAR (Letra H)
    if (key == 'h' || key == 'H') {
        flipCompositionHorizontal();
    }

    // ATALHO DE ENQUADRAR (Letra F) — já estava no modal, faltava aqui
    if (key == 'f' || key == 'F') {
        fitToScreen();
    }

    if (key == 'S' && keyIsDown(SHIFT)) exportProjectJSON();
    if (key == 'O' && keyIsDown(SHIFT)) importProjectJSON();
    if (key == 'E' && keyIsDown(SHIFT)) exportCharacterSVG(currentChar);
    if (key == 'A' && keyIsDown(SHIFT) && !modoCartaz) exportAlphabetSVG();
    if (key == 'Z' && keyIsDown(SHIFT) && !modoCartaz) exportAlphabetZIP();

    if (keyCode == DELETE || keyCode == BACKSPACE) {
        if (selectedModule === -2 || selectedModule === -1) apagarSelecao();
    }

    // Setas movem a seleção célula a célula
    if (selectedModule == -2 && selectedObjects.length > 0) {
        if (keyCode === LEFT_ARROW) { moverSelecao(-1, 0); return false; }
        if (keyCode === RIGHT_ARROW) { moverSelecao(1, 0); return false; }
        if (keyCode === UP_ARROW) { moverSelecao(0, -1); return false; }
        if (keyCode === DOWN_ARROW) { moverSelecao(0, 1); return false; }
    }

    if (key == 'g' || key == 'G') showSmallGrid = !showSmallGrid;

    if (key == 'r' || key == 'R') {
        if (selectedModule >= 0) {
            currentRotation++;
            if (currentRotation > 3) currentRotation = 0;
        } else if (selectedModule == -2) {
            if (isDraggingSelection) {
                revolveGroup(dragOriginals);
            } else if (selectedObjects.length > 0) {
                rotateSelectedObjects();
            }
        }
    }
}

function windowResized() {
    initAllCharacters();
    if (currentChar) {
        saveCharacter(currentChar);
    }
    resizeCanvas(windowWidth, windowHeight);
    calculateLayout();
    loadCharacter(currentChar);
}

function mouseDragged() {
    if (isDraggingSlider) {
        updateSliderFromMouse();
        return false;
    }

    // Rotação pelo punho: acumula o ângulo percorrido e aplica um salto de 90º
    // sempre que se atravessa um quadrante.
    if (isRotatingSelection) {
        var bb = getSelectionBounds();
        if (bb) {
            var ang = atan2(mouseY - bb.cy, mouseX - bb.cx);
            var d = ang - rotateLastAngle;
            while (d > 180) d -= 360;   // evita o salto ao passar por 180º
            while (d < -180) d += 360;
            rotateAccum += d;
            rotateLastAngle = ang;
            rotateHandleAngle = ang;   // o punho fica debaixo do rato

            var alvo = Math.round(rotateAccum / 90);
            if (alvo !== rotateStepsApplied) {
                if (applyRotationSteps(alvo)) rotateStepsApplied = alvo;
            }
        }
        return false;
    }

    if (keyIsDown(32) || mouseButton === CENTER || selectedModule === -3) {
        panX += mouseX - pmouseX;
        panY += mouseY - pmouseY;
        calculateLayout();
        return false;
    }

    // NOVA LINHA: Bloqueia o navegador de "roubar" o rato durante a seleção!
    return false;
}

function fitToScreen() {
    if (placedObjects.length === 0) {
        panX = 0; panY = 0; calculateLayout(); return;
    }

    // 1. Procurar os limites máximos e mínimos do desenho atual
    var minX = 99999, maxX = -99999, minY = 99999, maxY = -99999;

    for (var k = 0; k < placedObjects.length; k++) {
        var o = placedObjects[k];
        var dims = getModuleDims(o.type);
        var v = getFillVectors(o.rot);

        var corners = [
            { i: 0, j: 0 },
            { i: dims.len, j: 0 },
            { i: 0, j: dims.wid },
            { i: dims.len, j: dims.wid }
        ];

        for (var c = 0; c < corners.length; c++) {
            var px = o.x + (v.p.x * corners[c].i) + (v.s.x * corners[c].j);
            var py = o.y + (v.p.y * corners[c].i) + (v.s.y * corners[c].j);
            if (px < minX) minX = px;
            if (px > maxX) maxX = px;
            if (py < minY) minY = py;
            if (py > maxY) maxY = py;
        }
    }

    var bbW = maxX - minX;
    var bbH = maxY - minY;
    var bboxCenterX = minX + (bbW / 2);
    var bboxCenterY = minY + (bbH / 2);

    // 2. Calcular o zoom ideal com uma margem de segurança de 80px
    var margin = 80;
    var safeW = availableW - (margin * 2);
    var safeH = availableH - (margin * 2);

    if (bbW > 0 && bbH > 0) {
        var idealTileSize = min(safeW / bbW, safeH / bbH);
        var newTileSize = constrain(floor(idealTileSize), 5, 60);
        
        // CORREÇÃO: Apagámos o tileSizeSlider.value(...)
        // Agora basta atualizar o valor direto e o novo slider acompanha sozinho!
        tileSize = newTileSize; 
    }

    // 3. Mover a câmara para o centro geométrico exato do desenho
    panX = -(bboxCenterX - GRID_CX) * tileSize;
    panY = -(bboxCenterY - GRID_CY) * tileSize;

    calculateLayout();
}

function getDrawingCenterGrid() {
    if (placedObjects.length === 0) return { x: GRID_CX, y: GRID_CY };

    var minX = 99999, maxX = -99999, minY = 99999, maxY = -99999;

    for (var k = 0; k < placedObjects.length; k++) {
        var o = placedObjects[k];
        var dims = getModuleDims(o.type);
        var v = getFillVectors(o.rot);

        // Verificamos os cantos para precisão absoluta
        var corners = [{ i: 0, j: 0 }, { i: dims.len, j: dims.wid }];
        for (var c = 0; c < corners.length; c++) {
            var px = o.x + (v.p.x * corners[c].i) + (v.s.x * corners[c].j);
            var py = o.y + (v.p.y * corners[c].i) + (v.s.y * corners[c].j);
            minX = min(minX, px); maxX = max(maxX, px);
            minY = min(minY, py); maxY = max(maxY, py);
        }
    }
    return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
}

function revolveGroup(group, ccw) {
    if (group.length === 0) return;
    var minX = 99999, maxX = -99999, minY = 99999, maxY = -99999;

    // 1. Encontra a bounding box do grupo
    for (var k = 0; k < group.length; k++) {
        var o = group[k];
        var dims = getModuleDims(o.type);
        var v = getFillVectors(o.rot);
        var corners = [
            { i: 0, j: 0 }, { i: dims.len - 1, j: 0 },
            { i: 0, j: dims.wid - 1 }, { i: dims.len - 1, j: dims.wid - 1 }
        ];
        for (var c = 0; c < corners.length; c++) {
            var px = o.x + v.p.x * corners[c].i + v.s.x * corners[c].j;
            var py = o.y + v.p.y * corners[c].i + v.s.y * corners[c].j;
            if (px < minX) minX = px; if (px > maxX) maxX = px;
            if (py < minY) minY = py; if (py > maxY) maxY = py;
        }
    }

    // 2. Calcula o centro exato
    var cx = (minX + maxX) / 2;
    var cy = (minY + maxY) / 2;

    // Garante que o centro bate certo com o compasso da grelha
    if (Math.abs(cx % 1) !== Math.abs(cy % 1)) cx += 0.5;

    // 3. Aplica a translação de 90º a todas as peças
    for (var k = 0; k < group.length; k++) {
        var o = group[k];
        var newX, newY;
        if (ccw) {
            newX = cx + (o.y - cy);
            newY = cy - (o.x - cx);
            o.rot = (o.rot + 3) % 4;
        } else {
            newX = cx - (o.y - cy);
            newY = cy + (o.x - cx);
            o.rot = (o.rot + 1) % 4;
        }
        o.x = newX;
        o.y = newY;
    }
}

// --- COPIAR / COLAR ---------------------------------------------------------
var areaTransferencia = [];  // módulos copiados (guardados com posição absoluta)

function copiarSelecao() {
    if (selectedObjects.length === 0) return false;
    areaTransferencia = JSON.parse(JSON.stringify(selectedObjects));
    return true;
}

// Apaga o que está selecionado (usada pelo Delete e pelo Cortar).
// Remove também os espelhos gerados pela simetria, tal como o Delete fazia.
function apagarSelecao() {
    if (selectedObjects.length === 0) return false;
    saveHistory();
    for (var s = 0; s < selectedObjects.length; s++) {
        var grupo = getMirroredGroup(selectedObjects[s]);
        for (var g = 0; g < grupo.length; g++) {
            var m = grupo[g];
            for (var j = placedObjects.length - 1; j >= 0; j--) {
                var p = placedObjects[j];
                if (p.type == m.type && p.x == m.x && p.y == m.y && p.rot == m.rot) {
                    placedObjects.splice(j, 1);
                    removeObjFromCollisionMap(p);
                    break;
                }
            }
        }
    }
    selectedObjects = [];
    resetRotationBase();
    return true;
}

function cortarSelecao() {
    if (selectedObjects.length === 0) return false;
    copiarSelecao();
    return apagarSelecao();
}

// Duplica no lugar, ligeiramente ao lado — sem passar pela área de
// transferência, para não perder o que lá estiver copiado.
function duplicarSelecao() {
    if (selectedObjects.length === 0) return false;
    var original = JSON.parse(JSON.stringify(selectedObjects));
    var tentativas = [[2, 2], [1, 1], [3, 3], [0, 2], [2, 0], [-2, -2], [4, 4], [-1, -1]];

    for (var t = 0; t < tentativas.length; t++) {
        var dx = tentativas[t][0], dy = tentativas[t][1];
        var copia = [];
        for (var k = 0; k < original.length; k++) {
            var o = original[k];
            copia.push({ type: o.type, x: o.x + dx, y: o.y + dy, rot: o.rot });
        }
        if (checkPlacementValidGroup(copia)) {
            saveHistory();
            for (var k = 0; k < copia.length; k++) {
                placedObjects.push(copia[k]);
                addObjToCollisionMap(copia[k]);
            }
            selectedObjects = copia;   // a cópia fica selecionada
            selectedModule = -2;
            resetRotationBase();
            return true;
        }
    }
    return false;
}

// Canto superior-esquerdo do conjunto, em células
function cantoDoGrupo(grupo) {
    var minX = 1e9, minY = 1e9;
    for (var k = 0; k < grupo.length; k++) {
        var o = grupo[k], d = getModuleDims(o.type), v = getFillVectors(o.rot);
        var cs = [{ i: 0, j: 0 }, { i: d.len - 1, j: 0 }, { i: 0, j: d.wid - 1 }, { i: d.len - 1, j: d.wid - 1 }];
        for (var c = 0; c < 4; c++) {
            var px = o.x + v.p.x * cs[c].i + v.s.x * cs[c].j;
            var py = o.y + v.p.y * cs[c].i + v.s.y * cs[c].j;
            if (px < minX) minX = px;
            if (py < minY) minY = py;
        }
    }
    return { x: minX, y: minY };
}

// noSitio = cola nas coordenadas originais, sem seguir o rato. É o que permite
// levar uma letra inteira para outro artboard sem a desalinhar.
function colarAreaTransferencia(noSitio) {
    if (areaTransferencia.length === 0) return false;

    var canto = cantoDoGrupo(areaTransferencia);

    if (noSitio) {
        var grupo = JSON.parse(JSON.stringify(areaTransferencia));
        if (checkPlacementValidGroup(grupo)) {
            saveHistory();
            for (var k = 0; k < grupo.length; k++) {
                placedObjects.push(grupo[k]);
                addObjToCollisionMap(grupo[k]);
            }
            selectedObjects = grupo;
            selectedModule = -2;
            resetRotationBase();
            return true;
        }
        return false;   // não cabe exatamente aí; não inventa outro sítio
    }

    // Cola onde está o rato (se estiver sobre o artboard); caso contrário,
    // ligeiramente ao lado do original, para a cópia não ficar escondida.
    var destX, destY;
    if (mouseX > sidebarWidth && mouseY > topBarHeight) {
        destX = floor((mouseX - centerX) / tileSize) + GRID_CX;
        destY = floor((mouseY - centerY) / tileSize) + GRID_CY;
    } else {
        destX = canto.x + 2;
        destY = canto.y + 2;
    }

    // Se não couber no sítio pedido, procura um lugar próximo em vez de falhar
    var tentativas = [[0, 0], [1, 1], [2, 2], [-1, -1], [3, 3], [0, 2], [2, 0], [-2, -2], [4, 4]];
    for (var t = 0; t < tentativas.length; t++) {
        var dx = destX - canto.x + tentativas[t][0];
        var dy = destY - canto.y + tentativas[t][1];

        var grupo = [];
        for (var k = 0; k < areaTransferencia.length; k++) {
            var o = areaTransferencia[k];
            grupo.push({ type: o.type, x: o.x + dx, y: o.y + dy, rot: o.rot });
        }

        if (checkPlacementValidGroup(grupo)) {
            saveHistory();
            for (var k = 0; k < grupo.length; k++) {
                placedObjects.push(grupo[k]);
                addObjToCollisionMap(grupo[k]);
            }
            selectedObjects = grupo;      // fica selecionado, pronto a mover
            selectedModule = -2;          // e com a ferramenta certa ativa
            resetRotationBase();
            return true;
        }
    }
    return false; // não coube em lado nenhum por perto
}

// O Cmd+C/Cmd+V NÃO passa pelo keyPressed do p5 de propósito.
// O p5 ignora keydowns repetidos da mesma tecla enquanto não receber o keyup
// correspondente — e no macOS, com o Command premido, o sistema nunca envia
// esses keyup. Resultado: o atalho funcionava uma única vez e ficava preso.
// Este listener próprio não tem esse mecanismo, por isso responde sempre.
window.addEventListener('keydown', function (e) {
    if (!(e.metaKey || e.ctrlKey)) return;
    if (interfaceBloqueada()) return;
    if (typeof placedObjects === 'undefined') return;  // p5 ainda a arrancar
    if (showShortcutsModal) return;                    // manual aberto por cima
    // Cursor na caixa de texto: o Cmd+A, Cmd+C etc. são dela, não do artboard
    if (previewInputTemFoco()) return;

    var tecla = (e.key || '').toLowerCase();
    if (tecla === 'z') {
        // Shift+Z (ou Cmd+Y, à maneira do Windows) refaz
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
    } else if (tecla === 'y') {
        e.preventDefault();
        redo();
    } else if (tecla === 'a') {
        if (selecionarTudo()) e.preventDefault();
    } else if (tecla === 'c') {
        if (copiarSelecao()) e.preventDefault();
    } else if (tecla === 'x') {
        if (cortarSelecao()) e.preventDefault();
    } else if (tecla === 'v') {
        // Shift+V cola nas coordenadas originais — para levar uma letra
        // inteira para outro artboard sem a desalinhar.
        if (colarAreaTransferencia(e.shiftKey)) e.preventDefault();
    } else if (tecla === 'd') {
        // Havendo seleção, o atalho é nosso: bloqueia sempre o "adicionar aos
        // favoritos" do browser, mesmo que não haja espaço para a cópia.
        if (selectedObjects.length > 0) {
            e.preventDefault();
            duplicarSelecao();
        }
    }
});

// Onde o punho deve estar. Enquanto se arrasta, segue o rato; fora disso é
// SEMPRE derivado da rotação real da peça — assim acompanha a tecla R e, ao
// reselecionar mais tarde, aparece já no ângulo em que a peça está.
function anguloDoPunho() {
    if (isRotatingSelection) return rotateHandleAngle;
    if (selectedObjects.length === 0) return -90;
    return -90 + ((selectedObjects[0].rot % 4) + 4) % 4 * 90;
}

// Caixa que envolve os módulos selecionados, já em coordenadas de ecrã.
// Devolve null se não houver seleção.
function getSelectionBounds() {
    if (selectedObjects.length === 0) return null;

    var minX = 99999, maxX = -99999, minY = 99999, maxY = -99999;
    for (var k = 0; k < selectedObjects.length; k++) {
        var o = selectedObjects[k];
        var dims = getModuleDims(o.type);
        var v = getFillVectors(o.rot);
        var corners = [
            { i: 0, j: 0 }, { i: dims.len - 1, j: 0 },
            { i: 0, j: dims.wid - 1 }, { i: dims.len - 1, j: dims.wid - 1 }
        ];
        for (var c = 0; c < corners.length; c++) {
            var px = o.x + v.p.x * corners[c].i + v.s.x * corners[c].j;
            var py = o.y + v.p.y * corners[c].i + v.s.y * corners[c].j;
            if (px < minX) minX = px; if (px > maxX) maxX = px;
            if (py < minY) minY = py; if (py > maxY) maxY = py;
        }
    }

    // +1 na ponta porque cada célula ocupa um tileSize inteiro
    var x0 = centerX + (minX - GRID_CX) * tileSize;
    var y0 = centerY + (minY - GRID_CY) * tileSize;
    var x1 = centerX + (maxX + 1 - GRID_CX) * tileSize;
    var y1 = centerY + (maxY + 1 - GRID_CY) * tileSize;

    var ccx = (x0 + x1) / 2, ccy = (y0 + y1) / 2;
    var ang = anguloDoPunho();

    // O punho orbita o centro: usa o maior lado para se manter sempre fora da
    // caixa, seja qual for o ângulo, e não saltar quando a caixa muda de forma.
    var raio = max(x1 - x0, y1 - y0) / 2 + 26 * globalScale;

    return {
        x0: x0, y0: y0, x1: x1, y1: y1,
        cx: ccx, cy: ccy, raio: raio,
        ang: ang,
        hx: ccx + cos(ang) * raio,
        hy: ccy + sin(ang) * raio
    };
}

function drawSelectionBoundingBox() {
    hoveringRotateHandle = false;

    // Só na ferramenta Mover, com seleção, e fora de outras interações
    if (selectedModule !== -2 || selectedObjects.length === 0) return;
    if (isDraggingSelection || selectionBox.active || showShortcutsModal) return;

    var b = getSelectionBounds();
    if (!b) return;

    push();
    // Caixa tracejada
    rectMode(CORNERS); noFill();
    stroke(0, 200, 0); strokeWeight(0.75);
    drawingContext.setLineDash([4, 3]);
    rect(b.x0, b.y0, b.x1, b.y1);
    drawingContext.setLineDash([]);

    // Haste: começa onde o raio cruza a margem da caixa, para não riscar as peças
    var dx = cos(b.ang), dy = sin(b.ang);
    var hw = (b.x1 - b.x0) / 2, hh = (b.y1 - b.y0) / 2;
    var tX = Math.abs(dx) > 0.0001 ? hw / Math.abs(dx) : 1e9;
    var tY = Math.abs(dy) > 0.0001 ? hh / Math.abs(dy) : 1e9;
    var t = min(tX, tY);
    line(b.cx + dx * t, b.cy + dy * t, b.hx, b.hy);

    // Punho
    var sobre = dist(mouseX, mouseY, b.hx, b.hy) < 12 * globalScale;
    hoveringRotateHandle = sobre;
    if (sobre || isRotatingSelection) fill(0, 200, 0); else fill(249);
    stroke(0, 200, 0); strokeWeight(0.75);
    circle(b.hx, b.hy, 12 * globalScale);
    pop();
}

// Roda uma cópia do grupo n×90º NUMA SÓ operação, em torno do centro visual.
//
// Porquê de uma só vez: peças de dimensões ímpar×par (12, 13, 14, 17-20) têm o
// centro entre células, e cada rotação obriga a um arredondamento de meia
// célula. Encadeando rotações esse erro acumula — quatro voltas deixavam a peça
// 2 células fora do sítio. Assim o erro nunca passa de meia célula e n=0 ou n=4
// devolvem a posição original exata. Rotações de 180º ficam sempre exatas.
function rotateGroupBy(originals, n) {
    var g = JSON.parse(JSON.stringify(originals));
    n = ((n % 4) + 4) % 4;
    if (n === 0 || g.length === 0) return g;

    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (var k = 0; k < g.length; k++) {
        var o = g[k], d = getModuleDims(o.type), v = getFillVectors(o.rot);
        var cs = [{ i: 0, j: 0 }, { i: d.len - 1, j: 0 }, { i: 0, j: d.wid - 1 }, { i: d.len - 1, j: d.wid - 1 }];
        for (var c = 0; c < 4; c++) {
            var px = o.x + v.p.x * cs[c].i + v.s.x * cs[c].j;
            var py = o.y + v.p.y * cs[c].i + v.s.y * cs[c].j;
            if (px < minX) minX = px; if (px > maxX) maxX = px;
            if (py < minY) minY = py; if (py > maxY) maxY = py;
        }
    }
    var Cx = (minX + maxX + 1) / 2, Cy = (minY + maxY + 1) / 2;

    for (var k = 0; k < g.length; k++) {
        var o = g[k];
        var dx = (o.x + 0.5) - Cx, dy = (o.y + 0.5) - Cy;
        var nx, ny;
        if (n === 1) { nx = Cx - dy; ny = Cy + dx; }
        else if (n === 2) { nx = Cx - dx; ny = Cy - dy; }
        else { nx = Cx + dy; ny = Cy - dx; }
        o.x = Math.round(nx - 0.5);
        o.y = Math.round(ny - 0.5);
        o.rot = (o.rot + n) % 4;
    }
    return g;
}

// A base de rotação é fixada uma vez por seleção: tanto o punho como a tecla R
// trabalham em relação a ela, por isso nunca há acumulação de erro.
function resetRotationBase() {
    rotateOriginals = [];
    rotateStepsApplied = 0;
    rotateHandleAngle = -90;
}

function ensureRotationBase() {
    if (rotateOriginals.length === 0 && selectedObjects.length > 0) {
        rotateOriginals = JSON.parse(JSON.stringify(selectedObjects));
        rotateStepsApplied = 0;
    }
}

// Aplica N saltos de 90º partindo SEMPRE da base guardada.
function applyRotationSteps(n) {
    if (rotateOriginals.length === 0) return false;
    n = ((n % 4) + 4) % 4;

    // Tira da grelha o que lá está neste momento
    var anteriores = selectedObjects.slice();
    for (var i = 0; i < anteriores.length; i++) {
        var idx = placedObjects.indexOf(anteriores[i]);
        if (idx > -1) placedObjects.splice(idx, 1);
        removeObjFromCollisionMap(anteriores[i]);
    }

    // Parte sempre do original e roda n vezes
    var grupo = rotateGroupBy(rotateOriginals, n);

    // Junta os espelhos ativos
    var completo = [];
    for (var k = 0; k < grupo.length; k++) {
        var ms = getMirroredGroup(grupo[k]);
        for (var m = 0; m < ms.length; m++) {
            if (!containsObj(completo, ms[m])) completo.push(ms[m]);
        }
    }

    if (checkPlacementValidGroup(completo)) {
        for (var i = 0; i < completo.length; i++) {
            placedObjects.push(completo[i]);
            addObjToCollisionMap(completo[i]);
        }
        selectedObjects = completo.slice(0, grupo.length);
        return true;
    }

    // Não coube: repõe o que lá estava
    for (var i = 0; i < anteriores.length; i++) {
        placedObjects.push(anteriores[i]);
        addObjToCollisionMap(anteriores[i]);
    }
    selectedObjects = anteriores;
    return false;
}

// direcao: +1 horário, -1 anti-horário
function rodarSelecao(direcao) {
    if (selectedObjects.length === 0) return false;
    ensureRotationBase();
    saveHistory();
    var alvo = rotateStepsApplied + direcao;
    if (applyRotationSteps(alvo)) { rotateStepsApplied = alvo; return true; }
    return false;
}

function rotateSelectedObjects() {
    return rodarSelecao(1);
}

// Clique nas setas: roda a seleção, ou o módulo que está prestes a ser colocado
function rodarPelasSetas(direcao) {
    if (selectedModule >= 0) {
        currentRotation = (((currentRotation + direcao) % 4) + 4) % 4;
        return true;
    }
    if (selectedModule == -2 && selectedObjects.length > 0) {
        return rodarSelecao(direcao);
    }
    return false;
}



function exportProjectJSON() {
    acoes.expProjeto++;
    // 1. GUARDA O ESTADO ATUAL (A linha mágica que faltava!)
    saveCharacter(currentChar);

    // 2. Prepara o "pacote" com a memória atual do alfabeto
    var projectData = {
        version: "1.0",
        appName: "Plataforma Modular Tipográfica",
        // Carimbo da coorte: um alfabeto que te chegue por e-mail traz consigo
        // de que grupo veio, sem teres de perguntar.
        participante: participante ? participante.id : null,
        coorte: participante ? participante.coorte : null,
        characters: storedCharacters
    };

    // 3. Converte a memória num ficheiro de texto JSON
    var jsonStr = JSON.stringify(projectData);
    var blob = new Blob([jsonStr], { type: "application/json" });
    var url = URL.createObjectURL(blob);

    // 4. Força o navegador a descarregar o ficheiro
    var a = document.createElement("a");
    a.href = url;
    a.download = "meu-alfabeto-modular.json";

    a.setAttribute("data-no-ajax", "true"); // Impede o router do Cargo de intercetar o clique
    a.target = "_blank";

    document.body.appendChild(a); // Necessário no Firefox
    a.click();

    // 5. Limpa a memória temporária
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function importProjectJSON() {
    // 1. Cria um elemento input real
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    // O SEGREDO: Em vez de 'display: none', escondemos o botão fora do ecrã
    // Isto impede que o Safari/Firefox bloqueiem a abertura da janela!
    input.style.position = 'absolute';
    input.style.left = '-9999px';

    document.body.appendChild(input);

    // 2. O que acontece quando se escolhe o ficheiro:
    input.onchange = function (e) {
        var file = e.target.files[0];

        if (!file) {
            document.body.removeChild(input);
            return;
        }

        var reader = new FileReader();
        reader.onload = function (event) {
            try {
                // Lê e tenta converter de volta para a memória da plataforma
                var data = JSON.parse(event.target.result);

                if (data && data.characters) {
                    storedCharacters = data.characters; // Atualiza a memória global

                    panX = 0; // Centra a câmara para evitar que o projeto carregue "perdido" no espaço
                    panY = 0;

                    loadCharacter(currentChar);         // Atualiza a grelha visual
                    calculateLayout();                  // Refaz as matemáticas
                    realinharContagens();               // importar não é colocar
                } else {
                    avisar("This file doesn't look like a valid project for this platform.");
                }
            } catch (err) {
                avisar("Error reading the JSON file.");
            }

            // Limpa o botão invisível da página no final para não deixar rasto
            document.body.removeChild(input);
        };
        reader.readAsText(file);
    };

    // 3. Simula o clique e abre finalmente a janela do sistema operativo
    input.click();
}

function exportCharacterSVG(charToExport) {
    acoes.expLetra++;
    if (charToExport === currentChar) {
        saveCharacter(currentChar);
    }

    var objs = storedCharacters[charToExport] ? storedCharacters[charToExport].objects : [];

    if (!objs || objs.length === 0) {
        avisar(charToExport === CHAVE_CARTAZ
            ? "The poster is empty! There is nothing to export."
            : "The letter '" + charToExport + "' is empty! There is nothing to export.");
        return;
    }

    // 1. Calcular a Bounding Box VISUAL EXATA (para colar a arte perfeitamente ao Artboard)
    var minX = 99999, maxX = -99999, minY = 99999, maxY = -99999;

    for (var k = 0; k < objs.length; k++) {
        var o = objs[k];
        var dims = getModuleDims(o.type);

        // Centro exato da célula pivô
        var pivotX = o.x + 0.5;
        var pivotY = o.y + 0.5;

        // Offset visual e metades das dimensões (Tradução pura do desenho do ecrã)
        var offX = (dims.len - 1) * 0.5;
        var offY = (dims.wid - 1) * 0.5;
        var hw = dims.len / 2;
        var hh = dims.wid / 2;

        // 4 cantos do módulo (antes da rotação)
        var localCorners = [
            { x: offX - hw, y: offY - hh },
            { x: offX + hw, y: offY - hh },
            { x: offX + hw, y: offY + hh },
            { x: offX - hw, y: offY + hh }
        ];

        // Aplica a rotação geométrica aos 4 cantos
        for (var c = 0; c < 4; c++) {
            var lx = localCorners[c].x;
            var ly = localCorners[c].y;
            var rx = lx, ry = ly;

            if (o.rot === 1) { rx = -ly; ry = lx; }
            else if (o.rot === 2) { rx = -lx; ry = -ly; }
            else if (o.rot === 3) { rx = ly; ry = -lx; }

            var gx = pivotX + rx;
            var gy = pivotY + ry;

            // Expande a caixa do Artboard se a peça tocar mais longe
            if (gx < minX) minX = gx;
            if (gx > maxX) maxX = gx;
            if (gy < minY) minY = gy;
            if (gy > maxY) maxY = gy;
        }
    }

    // Tamanho grande para garantir qualidade
    var exportScale = 50;
    var bbW = (maxX - minX) * exportScale;
    var bbH = (maxY - minY) * exportScale;

    // 2. Construir o código nativo do SVG Final
    var svgStr = '<?xml version="1.0" encoding="utf-8"?>\n';
    svgStr += '<svg xmlns="http://www.w3.org/2000/svg" width="' + bbW + '" height="' + bbH + '" viewBox="0 0 ' + bbW + ' ' + bbH + '">\n';

    for (var k = 0; k < objs.length; k++) {
        var o = objs[k];
        var dims = getModuleDims(o.type);

        // Posiciona a âncora de cada peça em relação ao novo Artboard recalculado
        var svgPivotX = (o.x + 0.5 - minX) * exportScale;
        var svgPivotY = (o.y + 0.5 - minY) * exportScale;

        var drawW = dims.len * exportScale;
        var drawH = dims.wid * exportScale;
        var rotDeg = o.rot * 90;

        // Extração limpa do código SVG do módulo
        var rawCode = moduleSVGStrings[o.type].join(' ');
        var svgStart = rawCode.indexOf('<svg');
        var closeBracket = rawCode.indexOf('>', svgStart);
        var endIndex = rawCode.lastIndexOf('</svg>');
        var innerSVG = rawCode.substring(closeBracket + 1, endIndex);

        // Ler proporções originais
        var vbX = 0, vbY = 0, vbW = 100, vbH = 100;
        var viewBoxMatch = rawCode.match(/viewBox=["'](.*?)["']/i);

        if (viewBoxMatch) {
            var vbVals = viewBoxMatch[1].trim().split(/[\s,]+/);
            if (vbVals.length === 4) {
                vbX = parseFloat(vbVals[0]);
                vbY = parseFloat(vbVals[1]);
                vbW = parseFloat(vbVals[2]);
                vbH = parseFloat(vbVals[3]);
            }
        } else {
            var wMatch = rawCode.match(/width=["'](.*?)["']/i);
            var hMatch = rawCode.match(/height=["'](.*?)["']/i);
            if (wMatch) vbW = parseFloat(wMatch[1].replace(/[^0-9.]/g, ''));
            if (hMatch) vbH = parseFloat(hMatch[1].replace(/[^0-9.]/g, ''));
        }

        // Fator de escala exato para não distorcer formas curvas
        var scaleX = drawW / vbW;
        var scaleY = drawH / vbH;

        // 3. O Illustrator adora Matrizes de Transformação separadas (Grupos <g> dentro de Grupos <g>)
        svgStr += '  <!-- Módulo ' + etiquetaDoModulo(o.type) + ' -->\n';
        svgStr += '  <g transform="translate(' + svgPivotX + ' ' + svgPivotY + ') rotate(' + rotDeg + ')">\n';
        svgStr += '    <g transform="translate(' + (-exportScale / 2) + ' ' + (-exportScale / 2) + ') scale(' + scaleX + ' ' + scaleY + ') translate(' + (-vbX) + ' ' + (-vbY) + ')">\n';
        svgStr += '      ' + innerSVG + '\n';
        svgStr += '    </g>\n';
        svgStr += '  </g>\n';
    }

    svgStr += '</svg>';

    // 4. Download Automático
    var blob = new Blob([svgStr], { type: "image/svg+xml" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = (charToExport === CHAVE_CARTAZ)
        ? "Pragmatipo_Cartaz.svg"
        : "Letra_" + charToExport + "_Vetores.svg";

    a.setAttribute("data-no-ajax", "true");
    a.target = "_blank";

    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function exportAlphabetSVG() {
    acoes.expAlfabeto++;
    // 1. Atualiza a memória com o que está no ecrã neste momento
    saveCharacter(currentChar);

    var lettersToExport = [];

    // 2. Filtra apenas as letras que têm desenho
    for (var i = 0; i < characters.length; i++) {
        var char = characters[i];
        if (storedCharacters[char] && storedCharacters[char].objects.length > 0) {
            lettersToExport.push({ char: char, objs: storedCharacters[char].objects });
        }
    }

    if (lettersToExport.length === 0) {
        avisar("The alphabet is empty! Draw at least one letter.");
        return;
    }

    // 3. Configurações da Grelha do Mega SVG
    var exportScale = 50;
    var cols = 6; // 6 letras por linha
    var rows = Math.ceil(lettersToExport.length / cols);

    // Estimativa de um espaço seguro por letra (ex: 20x20 módulos)
    var cellW = 20 * exportScale;
    var cellH = 20 * exportScale;
    var padding = 2 * exportScale;

    var totalW = cols * (cellW + padding) + padding;
    var totalH = rows * (cellH + padding) + padding;

    // 4. Construir o Cabeçalho do SVG
    var svgStr = '<?xml version="1.0" encoding="utf-8"?>\n';
    svgStr += '<svg xmlns="http://www.w3.org/2000/svg" width="' + totalW + '" height="' + totalH + '" viewBox="0 0 ' + totalW + ' ' + totalH + '">\n';

    // Fundo branco opcional (ajuda a visualizar no browser)
    svgStr += '  <rect width="100%" height="100%" fill="#ffffff" />\n';

    // 5. Desenhar cada letra na sua "célula"
    for (var L = 0; L < lettersToExport.length; L++) {
        var item = lettersToExport[L];
        var col = L % cols;
        var row = Math.floor(L / cols);

        var cellX = padding + col * (cellW + padding);
        var cellY = padding + row * (cellH + padding);

        svgStr += '  <!-- LETRA ' + item.char + ' -->\n';
        svgStr += '  <g transform="translate(' + cellX + ' ' + cellY + ')">\n';

        // Colocar uma etiqueta subtil no topo da célula para o autor saber que letra é
        svgStr += '    <text x="0" y="-10" font-family="sans-serif" font-size="24" fill="#999999">' + item.char + '</text>\n';

        var objs = item.objs;
        for (var k = 0; k < objs.length; k++) {
            var o = objs[k];
            var dims = getModuleDims(o.type);

            // Relativo ao centro da grelha global do P5 (GRID_CX/CY)
            var localX = (o.x - GRID_CX + 10) * exportScale; // +10 para empurrar para o meio da célula
            var localY = (o.y - GRID_CY + 10) * exportScale;

            // Ajuste do pivô visual
            var svgPivotX = localX + (exportScale / 2);
            var svgPivotY = localY + (exportScale / 2);

            var drawW = dims.len * exportScale;
            var drawH = dims.wid * exportScale;
            var rotDeg = o.rot * 90;

            var rawCode = moduleSVGStrings[o.type].join(' ');
            var svgStart = rawCode.indexOf('<svg');
            var closeBracket = rawCode.indexOf('>', svgStart);
            var endIndex = rawCode.lastIndexOf('</svg>');
            var innerSVG = rawCode.substring(closeBracket + 1, endIndex);

            var vbX = 0, vbY = 0, vbW = 100, vbH = 100;
            var viewBoxMatch = rawCode.match(/viewBox=["'](.*?)["']/i);

            if (viewBoxMatch) {
                var vbVals = viewBoxMatch[1].trim().split(/[\s,]+/);
                if (vbVals.length === 4) {
                    vbX = parseFloat(vbVals[0]); vbY = parseFloat(vbVals[1]);
                    vbW = parseFloat(vbVals[2]); vbH = parseFloat(vbVals[3]);
                }
            }

            var scaleX = drawW / vbW;
            var scaleY = drawH / vbH;

            // Insere o módulo
            svgStr += '    <g transform="translate(' + svgPivotX + ' ' + svgPivotY + ') rotate(' + rotDeg + ')">\n';
            svgStr += '      <g transform="translate(' + (-exportScale / 2) + ' ' + (-exportScale / 2) + ') scale(' + scaleX + ' ' + scaleY + ') translate(' + (-vbX) + ' ' + (-vbY) + ')">\n';
            svgStr += '        ' + innerSVG + '\n';
            svgStr += '      </g>\n';
            svgStr += '    </g>\n';
        }
        svgStr += '  </g>\n';
    }

    svgStr += '</svg>';

    // 6. Download
    var blob = new Blob([svgStr], { type: "image/svg+xml" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;

    a.setAttribute("data-no-ajax", "true");
    a.target = "_blank";

    a.download = "Alfabeto_Completo.svg";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function exportAlphabetZIP() {
    acoes.expZip++;
    // 1. Verifica se a biblioteca JSZip foi bem carregada no HTML
    if (typeof JSZip === 'undefined') {
        avisar("Error: To export as ZIP, you need to add the JSZip link to your index.html file.");
        return;
    }

    // 2. Atualiza a memória com o que está no ecrã
    saveCharacter(currentChar);

    var zip = new JSZip(); // Cria o nosso "saco" virtual
    var hasLetters = false;

    // 3. Percorre todo o alfabeto à procura de letras com desenho
    for (var i = 0; i < characters.length; i++) {
        var charToExport = characters[i];
        var objs = storedCharacters[charToExport] ? storedCharacters[charToExport].objects : [];

        if (objs && objs.length > 0) {
            hasLetters = true;

            // --- CÁLCULO EXATO DA LETRA (Tal como na exportação isolada) ---
            var minX = 99999, maxX = -99999, minY = 99999, maxY = -99999;
            for (var k = 0; k < objs.length; k++) {
                var o = objs[k];
                var dims = getModuleDims(o.type);
                var pivotX = o.x + 0.5; var pivotY = o.y + 0.5;
                var offX = (dims.len - 1) * 0.5; var offY = (dims.wid - 1) * 0.5;
                var hw = dims.len / 2; var hh = dims.wid / 2;
                var localCorners = [
                    { x: offX - hw, y: offY - hh }, { x: offX + hw, y: offY - hh },
                    { x: offX + hw, y: offY + hh }, { x: offX - hw, y: offY + hh }
                ];
                for (var c = 0; c < 4; c++) {
                    var lx = localCorners[c].x, ly = localCorners[c].y;
                    var rx = lx, ry = ly;
                    if (o.rot === 1) { rx = -ly; ry = lx; }
                    else if (o.rot === 2) { rx = -lx; ry = -ly; }
                    else if (o.rot === 3) { rx = ly; ry = -lx; }
                    var gx = pivotX + rx; var gy = pivotY + ry;
                    if (gx < minX) minX = gx; if (gx > maxX) maxX = gx;
                    if (gy < minY) minY = gy; if (gy > maxY) maxY = gy;
                }
            }

            var exportScale = 50;
            var bbW = (maxX - minX) * exportScale;
            var bbH = (maxY - minY) * exportScale;

            var svgStr = '<?xml version="1.0" encoding="utf-8"?>\n';
            svgStr += '<svg xmlns="http://www.w3.org/2000/svg" width="' + bbW + '" height="' + bbH + '" viewBox="0 0 ' + bbW + ' ' + bbH + '">\n';

            for (var k = 0; k < objs.length; k++) {
                var o = objs[k];
                var dims = getModuleDims(o.type);
                var svgPivotX = (o.x + 0.5 - minX) * exportScale;
                var svgPivotY = (o.y + 0.5 - minY) * exportScale;
                var drawW = dims.len * exportScale;
                var drawH = dims.wid * exportScale;
                var rotDeg = o.rot * 90;

                var rawCode = moduleSVGStrings[o.type].join(' ');
                var svgStart = rawCode.indexOf('<svg');
                var closeBracket = rawCode.indexOf('>', svgStart);
                var endIndex = rawCode.lastIndexOf('</svg>');
                var innerSVG = rawCode.substring(closeBracket + 1, endIndex);

                var vbX = 0, vbY = 0, vbW = 100, vbH = 100;
                var viewBoxMatch = rawCode.match(/viewBox=["'](.*?)["']/i);
                if (viewBoxMatch) {
                    var vbVals = viewBoxMatch[1].trim().split(/[\s,]+/);
                    if (vbVals.length === 4) {
                        vbX = parseFloat(vbVals[0]); vbY = parseFloat(vbVals[1]);
                        vbW = parseFloat(vbVals[2]); vbH = parseFloat(vbVals[3]);
                    }
                } else {
                    var wMatch = rawCode.match(/width=["'](.*?)["']/i);
                    var hMatch = rawCode.match(/height=["'](.*?)["']/i);
                    if (wMatch) vbW = parseFloat(wMatch[1].replace(/[^0-9.]/g, ''));
                    if (hMatch) vbH = parseFloat(hMatch[1].replace(/[^0-9.]/g, ''));
                }

                var scaleX = drawW / vbW;
                var scaleY = drawH / vbH;

                svgStr += '  <!-- Módulo ' + etiquetaDoModulo(o.type) + ' -->\n';
                svgStr += '  <g transform="translate(' + svgPivotX + ' ' + svgPivotY + ') rotate(' + rotDeg + ')">\n';
                svgStr += '    <g transform="translate(' + (-exportScale / 2) + ' ' + (-exportScale / 2) + ') scale(' + scaleX + ' ' + scaleY + ') translate(' + (-vbX) + ' ' + (-vbY) + ')">\n';
                svgStr += '      ' + innerSVG + '\n';
                svgStr += '    </g>\n';
                svgStr += '  </g>\n';
            }
            svgStr += '</svg>';

            // 4. Adiciona o ficheiro SVG desta letra à pasta virtual ZIP
            zip.file(charToExport + ".svg", svgStr);
        }
    }

    if (!hasLetters) {
        avisar("The alphabet is empty! Draw at least one letter.");
        return;
    }

    // 5. Gera o pacote ZIP completo e força o download
    zip.generateAsync({ type: "blob" }).then(function (content) {
        var url = URL.createObjectURL(content);
        var a = document.createElement("a");
        a.href = url;
        a.download = "Alfabeto_Modulos_Isolados.zip";

        a.setAttribute("data-no-ajax", "true");
        a.target = "_blank";

        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    });
}

// --- LIMPEZA GLOBAL DO ALFABETO (COM UNDO) ---
function clearEntireAlphabet() {
    if (perguntar("Are you sure you want to clear the entire alphabet? You only can undo this later on each letter individually.")) {

        for (var i = 0; i < characters.length; i++) {
            var char = characters[i];
            if (!storedCharacters[char]) continue;

            if (char === currentChar) {
                if (placedObjects.length > 0) {
                    saveHistory();
                    placedObjects = [];
                    selectedObjects = [];
                    rebuildCollisionMap();
                }
            }
            else {
                if (storedCharacters[char].objects && storedCharacters[char].objects.length > 0) {
                    var hist = storedCharacters[char].history;
                    if (hist.length >= 15) hist.shift();
                    hist.push(JSON.parse(JSON.stringify(storedCharacters[char].objects)));
                    storedCharacters[char].redoHistory = [];
                    storedCharacters[char].objects = [];
                }
            }
        }
    }

    // --- SOLUÇÃO AQUI ---
    mouseIsPressed = false; // Força o p5 a saber que o clique terminou
    return false;           // Impede que o navegador propague o clique para o canvas
}

// --- DETEÇÃO DE SCROLL (RATO / TRACKPAD) ---
function mouseWheel(event) {
    // Com o modal aberto, a roda faz scroll ao manual
    if (showShortcutsModal) {
        modalScrollY = constrain(modalScrollY + event.delta, 0, modalMaxScroll);
        return false;
    }

    // Só deixa fazer scroll se o rato estiver a sobrevoar a barra lateral
    if (mouseX < sidebarWidth && mouseY > topBarHeight) {
        alphabetScrollY += event.delta; // Soma o movimento
        return false; // Bloqueia a página do browser de fazer scroll para baixo!
    }
}

// ==========================================
// FUNÇÃO MESTRE: ALTERAR TEMA VISUAL
// ==========================================
function setVisualTheme(theme) {
    currentVisualTheme = theme;
    if (theme === 'fill') {
        modules = modulesFill;
        moduleSVGStrings = moduleSVGStringsFill;
        redModules = redModulesFill;
        blueModules = blueModulesFill;
    } else if (theme === 'dotted') {
        modules = modulesDotted;
        moduleSVGStrings = moduleSVGStringsDotted;
        redModules = redModulesDotted;
        blueModules = blueModulesDotted;
    }
}

function drawSegmentedControl(cx, cy, w, h, options, selectedIdx) {
    var segW = w / options.length;
    var startX = cx - w / 2;

    // Fundo do Controlo
    fill(249); stroke(238); strokeWeight(0.75);
    rect(cx, cy, w, h, 6 * globalScale);

    for (var i = 0; i < options.length; i++) {
        var segCX = startX + (i * segW) + (segW / 2);
        var isHover = (mouseX > startX + i * segW && mouseX < startX + (i + 1) * segW && mouseY > cy - h / 2 && mouseY < cy + h / 2);

        // Fundo do "Botão" selecionado
        if (i === selectedIdx) {
            fill(255); stroke(238); strokeWeight(0.75);
            rect(segCX, cy, segW - 4 * globalScale, h - 4 * globalScale, 4 * globalScale);
        } else if (isHover && !showShortcutsModal) {
            fill(235); noStroke();
            rect(segCX, cy, segW - 4 * globalScale, h - 4 * globalScale, 4 * globalScale);
        }

        // Linhas Divisórias
        if (i > 0) {
            stroke(238); strokeWeight(0.75);
            line(startX + i * segW, cy - h / 3, startX + i * segW, cy + h / 3);
        }

        // Texto
        noStroke();
        fill(i === selectedIdx ? [0, 200, 0] : 120);
        textStyle(i === selectedIdx ? BOLD : NORMAL);
        textSize(10.5 * globalScale);
        text(options[i], segCX, cy);
    }
    textStyle(NORMAL);
}

// --- DIÁLOGOS NATIVOS (alert / confirm) ---
// Os diálogos do browser roubam o foco e engolem o mouseup: quando se fecham,
// o p5 continua a achar que o botão do rato está premido e o handleInteraction()
// desenha sem parar. Usar sempre estes invólucros em vez de alert()/confirm()
// diretos — repõem o estado do rato no fim.
function reporEstadoDoRato() {
    mouseIsPressed = false;
    suppressDrawUntilRelease = true; // o clique que abriu o diálogo não desenha
}

function avisar(mensagem) {
    alert(mensagem);
    reporEstadoDoRato();
}

function perguntar(mensagem) {
    var resposta = confirm(mensagem);
    reporEstadoDoRato();
    return resposta;
}

// --- VOLTAR AO SITE (com aviso de trabalho por guardar) ---
function hasUnsavedWork() {
    saveCharacter(currentChar); // a letra atual pode ainda não estar na memória
    var telas = listaDeTelas();
    for (var i = 0; i < telas.length; i++) {
        var store = storedCharacters[telas[i]];
        if (store && store.objects.length > 0) return true;
    }
    return false;
}

// Rede de segurança: a app não guarda nada em disco, por isso um Cmd+R
// distraído, um fechar de separador ou um clique no "voltar" apagavam o
// alfabeto inteiro sem aviso. Isto dá ao browser motivo para perguntar antes.
var saidaIntencional = false;

window.addEventListener('beforeunload', function (e) {
    if (saidaIntencional) return;      // o botão ← já fez a sua própria pergunta
    if (autosaveOK) return;            // está guardado no browser: sair é seguro
    if (!hasUnsavedWork()) return;     // nada para perder
    e.preventDefault();
    e.returnValue = '';                // exigido por alguns browsers
    return '';
});

function goToSite() {
    // Carregar em voltar ao site é a declaração mais clara de "terminei" que
    // esta ferramenta recebe. Aproveita-se, antes de a pessoa desaparecer.
    if (podePerguntarAvaliacao() && (sessao.letras + sessao.numeros) >= 1) { mostrarAvaliacao(true); return; }
    sairMesmo();
}

function sairMesmo() {
    if (!autosaveOK && hasUnsavedWork()) {
        var leave = perguntar("You have work on the canvas that isn't saved.\n\nLeaving now will discard it — use \"Save project (JSON)\" first if you want to keep it.\n\nLeave anyway?");
        if (!leave) return; // fica: a proteção do beforeunload mantém-se ativa
    }
    saidaIntencional = true; // só agora, para não haver dupla pergunta
    window.location.href = 'https://pragmatipo.pt';
}

function flipCompositionHorizontal() {
    if (placedObjects.length === 0) return;
    if (isOverlapMode) return; // Bloqueio de segurança (Só funciona em Letterpress)

    // 1. Encontrar o minX e maxX exato de toda a composição
    var minX = 99999, maxX = -99999;
    for (var k = 0; k < placedObjects.length; k++) {
        var o = placedObjects[k];
        var dims = getModuleDims(o.type);
        var v = getFillVectors(o.rot);
        var corners = [
            { i: 0, j: 0 }, { i: dims.len - 1, j: 0 },
            { i: 0, j: dims.wid - 1 }, { i: dims.len - 1, j: dims.wid - 1 }
        ];
        for (var c = 0; c < corners.length; c++) {
            var px = o.x + v.p.x * corners[c].i + v.s.x * corners[c].j;
            if (px < minX) minX = px;
            if (px > maxX) maxX = px;
        }
    }

    var localW = minX + maxX; // O Eixo Central Perfeito
    var newObjects = [];

    // 2. Calcular a inversão para cada peça
    for (var k = 0; k < placedObjects.length; k++) {
        var o = placedObjects[k];
        var type = o.type; var x = o.x; var y = o.y; var rot = o.rot;
        var dims = getModuleDims(type);
        var rotM, xM, yM = y;

        if (isCurveGroup(type) || isDiagonalGroup(type)) {
            rotM = { 0: 1, 1: 0, 2: 3, 3: 2 }[rot];
            xM = localW - x;
        } else if (isArchGroup(type)) {
            if (rot == 0) { rotM = 0; xM = localW - x - dims.len + 1; }
            else if (rot == 1) { rotM = 3; xM = localW - x; yM = y + dims.len - 1; }
            else if (rot == 2) { rotM = 2; xM = localW - x + dims.len - 1; }
            else if (rot == 3) { rotM = 1; xM = localW - x; yM = y - dims.len + 1; }
        } else {
            rotM = rot;
            if (rot == 0) xM = localW - x - dims.len + 1;
            if (rot == 1) xM = localW - x + dims.wid - 1;
            if (rot == 2) xM = localW - x + dims.len - 1;
            if (rot == 3) xM = localW - x - dims.wid + 1;
        }
        newObjects.push({ type: type, x: xM, y: yM, rot: rotM });
    }

    // 3. Testar a Colocação (Garante que não sai do Artboard)
    saveHistory(); // Guarda o estado para o Undo
    var backup = JSON.parse(JSON.stringify(placedObjects));
    placedObjects = [];
    rebuildCollisionMap();

    var allValid = true;
    for (var i = 0; i < newObjects.length; i++) {
        if (canPlaceTile(newObjects[i].x, newObjects[i].y, newObjects[i].type, newObjects[i].rot)) {
            placedObjects.push(newObjects[i]);
            addObjToCollisionMap(newObjects[i]);
        } else {
            allValid = false;
            break;
        }
    }

    // 4. Reverte tudo se a composição espelhada bater nas margens da folha
    if (!allValid) {
        storedCharacters[currentChar].history.pop(); // Remove o Undo que criámos
        placedObjects = backup;
        rebuildCollisionMap();
        avisar("The flipped composition hits the edges of the current artboard!");
    }
}

function updateSliderFromMouse() {
    var rawVal = map(mouseX, uiSlider.x, uiSlider.x + uiSlider.w, uiSlider.min, uiSlider.max);
    rawVal = constrain(rawVal, uiSlider.min, uiSlider.max);

    var steps = Math.round(rawVal / uiSlider.step);
    var newVal = steps * uiSlider.step;

    if (newVal !== tileSize) {
        var oldTileSize = tileSize;
        tileSize = newVal;

        if (placedObjects.length > 0) {
            var dCenter = getDrawingCenterGrid();
            panX -= (dCenter.x - GRID_CX) * (tileSize - oldTileSize);
            panY -= (dCenter.y - GRID_CY) * (tileSize - oldTileSize);
        }
        calculateLayout();
    }
}
// ===========================================================================
// PORTÃO DE ENTRADA — código de coorte, consentimentos e questionário
// ===========================================================================
// Antes de a ferramenta abrir: identifica-se o grupo, recolhem-se os
// consentimentos e responde-se ao questionário. Só depois o manual aparece.
//
// O formulário é HTML sobreposto ao canvas, não desenhado nele — de outro modo
// não haveria cursor, seleção nem teclado de sistema nos campos. E como o Cargo
// esvazia os blocos <style>, todo o CSS é aplicado por JS com !important.

// --- O QUE VAIS QUERER EDITAR ---------------------------------------------

// Códigos de coorte. À esquerda o que a pessoa escreve, à direita a etiqueta
// que fica nos dados. Acrescentar um grupo é acrescentar uma linha.
// Nota: isto não é segurança — quem abrir o código-fonte lê a lista. Serve
// para saber de que grupo veio cada resposta, não para trancar a porta.
// CÓDIGOS DE ACESSO
// -----------------------------------------------------------------------------
// Cada código determina duas colunas nos dados, e é decidido no momento em que o
// entregas a alguém:
//
//   coorte    — o grupo. Ex.: 'ESMAD', '16ET'.
//   material  — com que sistema FÍSICO essa pessoa trabalha na oficina.
//               'tipos'  = tipos móveis
//               'stencil'
//               'ambos'
//               'nenhum' = só usou a app
//               ''       = não registado
//
// O material vive aqui e não numa pergunta porque tu sabes melhor do que eles, e
// porque uma pergunta à entrada só apanharia "ainda não" quando a parte física
// vem depois da app.
//
// Para variantes dentro do mesmo grupo, duplica a linha e muda o material —
// entregas o código conforme o que cada metade da sala vai fazer.
//
// Nota: fica fixo à primeira entrada. Quem volta noutra sessão herda o mesmo
// código, por isso o material é o da altura em que se inscreveu.

var CODIGOS_COORTE = {
    //  código de acesso                   grupo                 material
    'pragmatipo-teste':        { coorte: 'TESTE',    material: 'nenhum'  },
    'pragmatipo-angelo':       { coorte: 'Angelo',   material: 'nenhum'  },

    'pragmatipo-16et':         { coorte: '16ET',     material: ''        },
    'pragmatipo-esmad':        { coorte: 'ESMAD',    material: ''        },
    'pragmatipo-diadaesmad':   { coorte: 'ESMAD',    material: ''        },

    'pragmatipo-esmad-tipos':   { coorte: 'ESMAD',   material: 'tipos'   },
    'pragmatipo-esmad-stencil': { coorte: 'ESMAD',   material: 'stencil' },
    'pragmatipo-esmad-ambos':   { coorte: 'ESMAD',   material: 'ambos'   }
};

// Aceita também a forma antiga, só com o nome do grupo — rede de segurança para
// quando acrescentares um código à pressa antes de uma oficina.
function resolverCodigo(codigo) {
    var v = CODIGOS_COORTE[codigo];
    if (!v) return null;
    if (typeof v === 'string') return { coorte: v, material: '' };
    return { coorte: v.coorte || '', material: v.material || '' };
}

// Endereço do Web App do Google Apps Script (ver apps-script-respostas.js).
// Enquanto estiver vazio, as respostas ficam só guardadas no browser.
var ENDPOINT_RESPOSTAS = 'https://script.google.com/macros/s/AKfycbwl4nbi9HfWLvnrH8WcJJBSTWoq0ts-g_vbhTl-bGi8XnelVowcRfzgnpajpqgeusynrQ/exec';

// Endereço de contacto. Aparece no texto do RGPD e no ecrã do código, para
// quem chegue sem ele. Num sítio só, para não divergirem.
var EMAIL_CONTACTO = 'adg@esmad.pt';

// Muda isto sempre que alterares o texto dos consentimentos: fica gravado em
// cada resposta, para saberes quem aceitou que versão.
var VERSAO_CONSENTIMENTO = '2026-08-02';

var CONSENTIMENTOS = [
    { id: 'rgpd', obrigatorio: true,
      texto: 'I agree that the information I provide here may be processed for this phd research, under the terms described above.' },
    { id: 'obra', obrigatorio: true,
      texto: 'I agree that the letterforms I produce with this tool may be reproduced and discussed in the thesis and in related academic publications.' }
];

var PERGUNTAS = [
    { id: 'escola', tipo: 'texto', obrigatoria: true,
      label: 'School or institution' },
    { id: 'pais', tipo: 'escolha', obrigatoria: true,
      label: 'Where are you based?',
      opcoes: ['Portugal', 'Another country'] },
    { id: 'idade', tipo: 'numero', obrigatoria: true, min: 10, max: 120,
      label: 'Age' },
    { id: 'genero', tipo: 'escolha', obrigatoria: true,
      label: 'Gender',
      opcoes: ['Female', 'Male', 'Other', 'Prefer not to say'] },
    { id: 'grau', tipo: 'escolha', obrigatoria: true,
      label: 'Level of study',
      opcoes: ['Secondary school', 'Vocational course',
               'Bachelor — 1st year', 'Bachelor — 2nd year', 'Bachelor — 3rd year',
               'Master — 1st year', 'Master — 2nd year', 'PhD',
               'Not studying right now'] },
    { id: 'profissao', tipo: 'escolha', obrigatoria: true,
      label: 'What do you do?',
      opcoes: ['Student', 'Graphic or communication designer', 'Type designer',
               'Illustrator', 'Teacher or lecturer', 'Printer or letterpress practitioner',
               'Artist', 'Architect', 'Other'] },
    { id: 'comoConheceu', tipo: 'escolha', obrigatoria: true,
      label: 'How did you hear about Pragmatipo?',
      opcoes: ['A workshop or class', 'A teacher', 'A friend or colleague',
               'Social media', 'A talk or conference', 'Found it online', 'Other'] },

    // As tres seguintes partilham a mesma escala de propósito: assim as
    // respostas comparam-se entre si em vez de serem tres coisas soltas.
    { id: 'experiencia', tipo: 'escolha', obrigatoria: true,
      label: 'Have you designed type before?',
      opcoes: ['Never', 'Once or twice', 'Several times', 'Regularly'] },
    { id: 'letterpress', tipo: 'escolha', obrigatoria: true,
      label: 'Have you worked with movable type (letterpress)?',
      opcoes: ['Never', 'Once or twice', 'Several times', 'Regularly'] },
    { id: 'stencil', tipo: 'escolha', obrigatoria: true,
      label: 'Have you used stencils to draw letters?',
      opcoes: ['Never', 'Once or twice', 'Several times', 'Regularly'] }
];

var TEXTO_RGPD =
    'This tool is part of doctoral research on modular letterpress type systems. ' +
    'The answers below are collected by Ângelo Gonçalves and used only for that research. ' +
    'No name, e-mail or any other direct identifier is asked for, and your answers are stored under an anonymous code. ' +
    'Alongside your answers, the research also records how the tool is used: how often you come back, how long you work, ' +
    'which letters and modules you build, how you rotate and arrange them, which working mode you choose, and which ' +
    'commands you reach for. Nothing you type into the tool itself is recorded, and the letterforms themselves are never sent. ' +
    'You can ask for your data to be deleted at any time by sending that code to ' + EMAIL_CONTACTO + '.';

// --- ESTADO ----------------------------------------------------------------

var CHAVE_PARTICIPANTE = 'pragmatipo-participante';
var CHAVE_POR_ENVIAR = 'pragmatipo-por-enviar';
var portaoAberto = false;
var participante = null;     // { id, coorte, quando }
var overlayPortao = null;

// Estilos aplicados por JS com !important: o Cargo esvazia CSS em <style>.
function estilo(el, props) {
    for (var k in props) el.style.setProperty(k, props[k], 'important');
    return el;
}

function novoIdParticipante() {
    var s = 'P';
    for (var i = 0; i < 8; i++) s += '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'[floor(random(34))];
    return s;
}

// --- ENVIO -----------------------------------------------------------------
// Grava primeiro localmente e só depois tenta enviar. Numa oficina com rede
// fraca, uma resposta perdida é um participante perdido — por isso o que não
// sai fica em fila e volta a ser tentado na visita seguinte.

function enfileirarResposta(resposta) {
    var fila = [];
    try { fila = JSON.parse(localStorage.getItem(CHAVE_POR_ENVIAR) || '[]'); } catch (e) {}
    fila.push(resposta);
    try { localStorage.setItem(CHAVE_POR_ENVIAR, JSON.stringify(fila)); } catch (e) {}
}

function escoarFila() {
    if (!ENDPOINT_RESPOSTAS) return;
    var fila = [];
    try { fila = JSON.parse(localStorage.getItem(CHAVE_POR_ENVIAR) || '[]'); } catch (e) { return; }
    if (fila.length === 0) return;

    // Esvazia já: se falhar, volta a entrar. Evita enviar duas vezes o mesmo.
    try { localStorage.setItem(CHAVE_POR_ENVIAR, '[]'); } catch (e) {}
    fila.forEach(function (r) {
        // text/plain não desencadeia preflight, por isso dá para pedir em modo
        // cors e LER a resposta. Vale a pena: em no-cors, um erro do Apps Script
        // era indistinguível de sucesso e a resposta perdia-se em silêncio —
        // péssimo modo de falhar quando o que se perde são dados de investigação.
        fetch(ENDPOINT_RESPOSTAS, {
            method: 'POST', mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(r)
        })
        .then(function (resp) {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.text();
        })
        .then(function (texto) {
            var d = null;
            try { d = JSON.parse(texto); } catch (e) {}
            if (!d || !d.ok) throw new Error('resposta inesperada');
        })
        .catch(function () { enfileirarResposta(r); });   // volta à fila
    });
}

// --- CONSTRUÇÃO DO FORMULÁRIO ---------------------------------------------

function campoBase() {
    return { 'width': '100%', 'box-sizing': 'border-box', 'font': '400 13px \'Marist Variable\', Helvetica, Arial, sans-serif',
             'color': '#111', 'background': '#fff', 'border': '0.75px solid #ddd',
             'border-radius': '6px', 'padding': '9px 10px', 'margin': '0', 'outline': 'none' };
}

function construirPortao() {
    var ov = document.createElement('div');
    ov.id = 'pragmatipo-portao';
    estilo(ov, {
        'position': 'fixed', 'inset': '0', 'left': '0', 'top': '0',
        'width': '100%', 'height': '100%', 'z-index': '2147483000',
        'background': 'rgba(0,0,0,0.55)', 'display': 'flex',
        'align-items': 'center', 'justify-content': 'center',
        'overflow': 'auto', 'padding': '24px'
    });

    var caixa = document.createElement('div');
    estilo(caixa, {
        'width': '100%', 'max-width': '520px', 'background': '#fff',
        'border-radius': '16px', 'padding': '32px', 'box-sizing': 'border-box',
        'font': '400 13px \'Marist Variable\', Helvetica, Arial, sans-serif', 'color': '#111',
        'max-height': '100%', 'overflow-y': 'auto'
    });
    ov.appendChild(caixa);
    document.body.appendChild(ov);
    overlayPortao = ov;
    passoCodigo(caixa);
    return ov;
}

function titulo(caixa, t, sub) {
    caixa.innerHTML = '';
    var h = document.createElement('div');
    h.textContent = t;
    estilo(h, { 'font': '700 26px \'Marist Variable\', Helvetica, Arial, sans-serif', 'margin': '0 0 4px' });
    caixa.appendChild(h);
    var s = document.createElement('div');
    s.textContent = sub;
    estilo(s, { 'font': '400 12px \'Marist Variable\', Helvetica, Arial, sans-serif', 'color': '#888', 'margin': '0 0 22px' });
    caixa.appendChild(s);
}

function botao(texto) {
    var b = document.createElement('button');
    b.textContent = texto;
    estilo(b, {
        'width': '100%', 'padding': '12px', 'margin': '18px 0 0', 'cursor': 'pointer',
        'font': '700 12px \'Marist Variable\', Helvetica, Arial, sans-serif', 'color': '#0a0',
        'background': '#f2fff2', 'border': '0.75px solid #0a0', 'border-radius': '6px'
    });
    return b;
}

function erro(caixa, msg) {
    var e = document.createElement('div');
    e.textContent = msg;
    estilo(e, { 'font': '400 12px \'Marist Variable\', Helvetica, Arial, sans-serif', 'color': '#c00', 'margin': '10px 0 0' });
    caixa.appendChild(e);
    return e;
}

// --- PASSO 1: CÓDIGO DE COORTE --------------------------------------------

function passoCodigo(caixa) {
    titulo(caixa, 'Pragmatipo', 'Enter the code you were given');

    var inp = document.createElement('input');
    inp.type = 'text'; inp.setAttribute('autocomplete', 'off');
    inp.setAttribute('placeholder', 'Access code');
    estilo(inp, campoBase());
    caixa.appendChild(inp);

    var msg = null;
    var b = botao('Continue');
    caixa.appendChild(b);

    // Quem chega sem código não pode ficar num beco: dá-se-lhe para onde escrever.
    var ajuda = document.createElement('div');
    estilo(ajuda, { 'font': '400 12px \'Marist Variable\', Helvetica, Arial, sans-serif', 'color': '#888',
                    'margin': '16px 0 0', 'text-align': 'center', 'line-height': '1.5' });
    ajuda.appendChild(document.createTextNode('No code? Get in touch: '));
    var lnk = document.createElement('a');
    lnk.href = 'mailto:' + EMAIL_CONTACTO + '?subject=' + encodeURIComponent('Pragmatipo — access code');
    lnk.textContent = EMAIL_CONTACTO;
    estilo(lnk, { 'color': '#0a0', 'text-decoration': 'underline' });
    ajuda.appendChild(lnk);
    caixa.appendChild(ajuda);

    function tentar() {
        var codigo = (inp.value || '').trim().toLowerCase();
        var grupo = resolverCodigo(codigo);
        if (!grupo) {
            if (!msg) msg = erro(caixa, 'That code is not recognised. Check it and try again.');
            estilo(inp, { 'border-color': '#c00' });
            return;
        }
        passoFormulario(caixa, grupo);
    }
    b.addEventListener('click', tentar);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') tentar(); });
    setTimeout(function () { inp.focus(); }, 0);
}

// --- PASSO 2: CONSENTIMENTOS E QUESTIONÁRIO -------------------------------

function passoFormulario(caixa, grupo) {
    titulo(caixa, 'Before you start', 'A few questions for the research behind this tool');

    var intro = document.createElement('div');
    intro.textContent = TEXTO_RGPD;
    estilo(intro, { 'font': '400 12px \'Marist Variable\', Helvetica, Arial, sans-serif', 'color': '#555',
                    'line-height': '1.55', 'margin': '0 0 22px' });
    caixa.appendChild(intro);

    // -- perguntas
    var campos = {};
    PERGUNTAS.forEach(function (p) {
        var lbl = document.createElement('label');
        lbl.textContent = p.label + (p.obrigatoria ? '' : ' (optional)');
        estilo(lbl, { 'display': 'block', 'font': '700 11px \'Marist Variable\', Helvetica, Arial, sans-serif',
                      'color': '#555', 'margin': '0 0 6px' });
        caixa.appendChild(lbl);

        var el;
        if (p.tipo === 'escolha') {
            el = document.createElement('select');
            var vazio = document.createElement('option');
            vazio.value = ''; vazio.textContent = '—';
            el.appendChild(vazio);
            p.opcoes.forEach(function (o) {
                var op = document.createElement('option');
                op.value = o; op.textContent = o;
                el.appendChild(op);
            });
        } else {
            el = document.createElement('input');
            el.type = (p.tipo === 'numero') ? 'number' : 'text';
            if (p.min != null) el.min = p.min;
            if (p.max != null) el.max = p.max;
            el.setAttribute('autocomplete', 'off');
        }
        estilo(el, campoBase());
        estilo(el, { 'margin': '0 0 16px' });
        caixa.appendChild(el);
        campos[p.id] = el;
    });

    // -- consentimentos, um a um e não num "aceito tudo"
    var caixasConsent = {};
    CONSENTIMENTOS.forEach(function (c) {
        var linha = document.createElement('label');
        estilo(linha, { 'display': 'flex', 'gap': '10px', 'align-items': 'flex-start',
                        'margin': '0 0 12px', 'cursor': 'pointer',
                        'font': '400 12px \'Marist Variable\', Helvetica, Arial, sans-serif',
                        'color': '#333', 'line-height': '1.5' });
        var chk = document.createElement('input');
        chk.type = 'checkbox';
        estilo(chk, { 'margin': '2px 0 0', 'flex': '0 0 auto', 'width': '15px', 'height': '15px' });
        var txt = document.createElement('span');
        txt.textContent = c.texto;
        linha.appendChild(chk); linha.appendChild(txt);
        caixa.appendChild(linha);
        caixasConsent[c.id] = chk;
    });

    var msg = null;
    var b = botao('Start drawing');
    caixa.appendChild(b);

    b.addEventListener('click', function () {
        var respostas = {}, faltam = [];
        PERGUNTAS.forEach(function (p) {
            var v = (campos[p.id].value || '').trim();
            if (p.obrigatoria && !v) faltam.push(p.label);
            if (p.tipo === 'numero' && v) {
                var n = parseInt(v, 10);
                if (isNaN(n) || (p.min != null && n < p.min) || (p.max != null && n > p.max)) faltam.push(p.label);
            }
            respostas[p.id] = v;
        });
        var faltaConsentir = false;
        CONSENTIMENTOS.forEach(function (c) {
            if (c.obrigatorio && !caixasConsent[c.id].checked) faltaConsentir = true;
            respostas['consent_' + c.id] = !!caixasConsent[c.id].checked;
        });
        // Uma menção só, por muitas caixas que faltem assinalar.
        if (faltaConsentir) faltam.push('the agreements above');
        if (faltam.length) {
            if (msg) msg.remove();
            msg = erro(caixa, 'Still missing: ' + faltam.join(', '));
            return;
        }
        concluirPortao(grupo, respostas);
    });
}

// --- CONCLUSÃO -------------------------------------------------------------

function concluirPortao(grupo, respostas) {
    participante = { id: novoIdParticipante(), coorte: grupo.coorte,
                     material: grupo.material, quando: new Date().toISOString() };

    var registo = {
        participante: participante.id,
        coorte: participante.coorte,
        material: participante.material,
        quando: participante.quando,
        versaoConsentimento: VERSAO_CONSENTIMENTO,
        ecra: window.innerWidth + 'x' + window.innerHeight,   // não as globais do p5
        idioma: navigator.language || ''
    };
    for (var k in respostas) registo[k] = respostas[k];

    enfileirarResposta(registo);   // guardar antes de enviar, sempre
    escoarFila();

    try { localStorage.setItem(CHAVE_PARTICIPANTE, JSON.stringify(participante)); } catch (e) {}

    abrirPortao();
}

function abrirPortao() {
    portaoAberto = true;
    if (overlayPortao) { overlayPortao.remove(); overlayPortao = null; }
    iniciarSessao();
    mostrarManualNaPrimeiraVisita();
}

// Chamado no setup(). Quem já respondeu não volta a ser interrogado.
function iniciarPortao() {
    try {
        var guardado = JSON.parse(localStorage.getItem(CHAVE_PARTICIPANTE) || 'null');
        if (guardado && guardado.id) {
            participante = guardado;
            portaoAberto = true;
            escoarFila();            // resgata respostas que não chegaram a sair
            iniciarSessao();
            mostrarManualNaPrimeiraVisita();
            return;
        }
    } catch (e) {
        // localStorage bloqueado: pergunta na mesma, e a resposta perde-se ao
        // fechar. Preferível a deixar entrar sem consentimento.
    }
    construirPortao();
}

// --- SESSÕES ---------------------------------------------------------------
// Conta quantas vezes cada participante voltou *para desenhar*. Abrir a página
// e não tocar em nada não conta — senão a métrica media curiosidade, não uso.
//
// O resumo vai sendo gravado no browser enquanto se trabalha, e é despachado
// no fim (sendBeacon) ou, se o separador morrer sem aviso, no arranque
// seguinte. Assim um crash custa os últimos segundos, não a sessão inteira.

// Três medidas distintas do uso dos módulos. Todas derivadas de comparar
// fotografias do alfabeto, e não de apanhar cada colocação à mão: os módulos
// entram no artboard por doze caminhos diferentes (desenhar, colar, duplicar,
// espelho, rollback…) e hooká-los um a um seria frágil. Comparar contagens
// apanha-os todos, venham de onde vierem.
var CHAVE_USOS = 'pragmatipo-usos';        // colocações acumuladas, por participante
var usosAcumulados = {};                   // nunca desce
var baseSessao = {};                       // fotografia no início da sessão
var ultimaContagem = {};                   // fotografia do tique anterior

// Comportamento da sessão. Tudo somado em memória e despejado no registo.
var acoes = {
    recusas: 0,          // colocações barradas pelo modo Letterpress
    undos: 0,
    preview: 0,          // vezes que abriu o Preview word
    expLetra: 0, expAlfabeto: 0, expZip: 0, expProjeto: 0,
    trocasDeModo: 0
};
var tempoModo = { letterpress: 0, livre: 0 };   // segundos em cada modo
var modoDesde = Date.now();
var ultimaRecusa = '';       // desduplica recusas repetidas na mesma célula
var CHAVE_PRIMEIRO = 'pragmatipo-primeiro-caractere';
var primeiroCaractere = null;

var CHAVE_USOS_LETRA = 'pragmatipo-usos-letra';   // o mesmo, desdobrado por caractere
var usosPorLetra = {};
var baseLetra = {};
var ultimaLetra = {};

var CHAVE_SESSAO = 'pragmatipo-sessao';
var CHAVE_N_SESSOES = 'pragmatipo-n-sessoes';
var sessao = null;

function contarTrabalho() {
    var letras = 0, numeros = 0, modulos = 0, cartaz = 0;

    // Contagem por módulo, com o NOME DO FICHEIRO (00.svg -> "00"), não com a
    // etiqueta da interface. O ficheiro é identificador estável; a etiqueta é
    // uma escolha de apresentação, e essa já mudou uma vez. Arranca a zeros
    // para que um módulo nunca usado apareça como 0 em vez de faltar: a
    // ausência também é resultado.
    var porModulo = {};
    for (var m = 0; m < modules.length; m++) porModulo[nf(m, 2)] = 0;

    // Contagem desdobrada por caractere: chaves "A|00", "7|21". Só entram as
    // combinações usadas, para não guardar 792 zeros a cada segundo.
    var porLetra = {};

    // Rotações usadas, por módulo. Um módulo usado nas quatro orientações
    // rende quatro vezes mais ao sistema do que um preso a uma só.
    var porRotacao = {};

    // O cartaz entra nas contagens de módulos — um módulo usado num cartaz foi
    // usado na mesma — mas não conta como letra nem como número. Fica separado
    // em `cartaz` e etiquetado nas linhas, para se poder filtrar na análise.
    var telas = listaDeTelas();
    for (var i = 0; i < telas.length; i++) {
        var c = telas[i];
        var objs = (c === currentChar) ? placedObjects
                 : (storedCharacters[c] ? storedCharacters[c].objects : []);
        if (!objs || !objs.length) continue;
        if (c === CHAVE_CARTAZ) cartaz += objs.length;
        else if (c >= '0' && c <= '9') numeros++;
        else letras++;
        modulos += objs.length;
        for (var k = 0; k < objs.length; k++) {
            var ficheiro = nf(objs[k].type, 2);
            if (porModulo[ficheiro] !== undefined) porModulo[ficheiro]++;
            var chave = c + '|' + ficheiro;
            porLetra[chave] = (porLetra[chave] || 0) + 1;
            var kr = ficheiro + '|' + (objs[k].rot % 4);
            porRotacao[kr] = (porRotacao[kr] || 0) + 1;
        }
    }
    return { letras: letras, numeros: numeros, desenhados: letras + numeros,
             cartaz: cartaz, modulos: modulos,
             porModulo: porModulo, porLetra: porLetra, porRotacao: porRotacao };
}

// Copia uma contagem, para as fotografias não ficarem ligadas à mesma memória.
// O tempo em cada modo é fechado quando o modo muda e antes de gravar. Assim
// não é preciso um contador a correr: a diferença entre instantes basta.
function fecharJanelaDeModo() {
    var agora = Date.now();
    var decorrido = (agora - modoDesde) / 1000;
    if (decorrido > 0) {
        if (isOverlapMode) tempoModo.livre += decorrido;
        else tempoModo.letterpress += decorrido;
    }
    modoDesde = agora;
}

function definirModo(livre) {
    if (isOverlapMode === livre) return;
    fecharJanelaDeModo();
    isOverlapMode = livre;
    acoes.trocasDeModo++;
}

function copiaContagem(c) {
    var out = {};
    for (var k in c) out[k] = c[k];
    return out;
}

function contagemVazia() {
    var out = {};
    for (var m = 0; m < modules.length; m++) out[nf(m, 2)] = 0;
    return out;
}

// Usado depois de importar um projeto: alinha as referências sem contar nada.
// Sem isto, abrir um ficheiro com 300 módulos registava 300 colocações.
function realinharContagens() {
    var t = contarTrabalho();
    ultimaContagem = copiaContagem(t.porModulo);
    baseSessao = copiaContagem(t.porModulo);
    ultimaLetra = copiaContagem(t.porLetra);
    baseLetra = copiaContagem(t.porLetra);
}

function guardarSessao() {
    try { localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao)); } catch (e) {}
}

function iniciarSessao() {
    if (!participante) return;

    // Sessão anterior que ficou por fechar: vai agora, com os últimos números
    // que chegaram a ser gravados.
    try {
        var pendente = JSON.parse(localStorage.getItem(CHAVE_SESSAO) || 'null');
        if (pendente && pendente.desenhou) despacharSessao(pendente);
    } catch (e) {}
    try { localStorage.removeItem(CHAVE_SESSAO); } catch (e) {}

    try {
        usosAcumulados = JSON.parse(localStorage.getItem(CHAVE_USOS) || '{}') || {};
    } catch (e) { usosAcumulados = {}; }
    try {
        usosPorLetra = JSON.parse(localStorage.getItem(CHAVE_USOS_LETRA) || '{}') || {};
    } catch (e) { usosPorLetra = {}; }

    // A base da sessão é o alfabeto tal como chegou — já com o que veio do
    // autosave. Assim o "dif" mede esta sessão e não o histórico todo.
    acoes = { recusas: 0, undos: 0, preview: 0,
              expLetra: 0, expAlfabeto: 0, expZip: 0, expProjeto: 0, trocasDeModo: 0 };
    tempoModo = { letterpress: 0, livre: 0 };
    modoDesde = Date.now();
    try { primeiroCaractere = localStorage.getItem(CHAVE_PRIMEIRO) || null; } catch (e) {}

    var inicial = contarTrabalho();
    baseSessao = copiaContagem(inicial.porModulo);
    ultimaContagem = copiaContagem(inicial.porModulo);
    baseLetra = copiaContagem(inicial.porLetra);
    ultimaLetra = copiaContagem(inicial.porLetra);

    sessao = {
        tipo: 'sessao',
        sessaoId: novoIdParticipante(),      // permite despistar duplicados
        participante: participante.id,
        coorte: participante.coorte,
        material: participante.material || '',
        numero: null,                        // atribuído ao primeiro módulo
        inicio: new Date().toISOString(),
        fim: null, segundos: 0,
        desenhou: false, letras: 0, numeros: 0, cartaz: 0, modulos: 0
    };
    escoarFila();
}

// Chamado quando o trabalho muda de facto. É aqui que a sessão passa a contar.
function registarActividade() {
    if (!sessao) return;
    var t = contarTrabalho();
    if (t.modulos === 0) return;             // alfabeto vazio não é desenhar

    if (!sessao.desenhou) {
        sessao.desenhou = true;
        var n = 0;
        try { n = parseInt(localStorage.getItem(CHAVE_N_SESSOES) || '0', 10) || 0; } catch (e) {}
        sessao.numero = n + 1;
        try { localStorage.setItem(CHAVE_N_SESSOES, String(sessao.numero)); } catch (e) {}
    }
    sessao.fim = new Date().toISOString();
    sessao.segundos = Math.round((Date.now() - Date.parse(sessao.inicio)) / 1000);
    sessao.letras = t.letras;     // A–Z (quantos artboards têm desenho)
    sessao.numeros = t.numeros;   // 0–9
    sessao.cartaz = t.cartaz;     // peças no cartaz; 0 = nunca usou o modo
    sessao.modulos = t.modulos;   // total, cartaz incluído

    // B — colocações acumuladas: só as subidas contam. Apagar não desconta,
    // por isso o número mede quantas vezes se pegou no módulo, não o que ficou.
    for (var m = 0; m < modules.length; m++) {
        var fich = nf(m, 2);
        var subida = (t.porModulo[fich] || 0) - (ultimaContagem[fich] || 0);
        if (subida > 0) usosAcumulados[fich] = (usosAcumulados[fich] || 0) + subida;
    }
    ultimaContagem = copiaContagem(t.porModulo);
    try { localStorage.setItem(CHAVE_USOS, JSON.stringify(usosAcumulados)); } catch (e) {}

    // O mesmo raciocínio, desdobrado por caractere.
    for (var chave in t.porLetra) {
        var sobe = t.porLetra[chave] - (ultimaLetra[chave] || 0);
        if (sobe > 0) usosPorLetra[chave] = (usosPorLetra[chave] || 0) + sobe;
    }
    ultimaLetra = copiaContagem(t.porLetra);
    try { localStorage.setItem(CHAVE_USOS_LETRA, JSON.stringify(usosPorLetra)); } catch (e) {}

    // A primeira letra que a pessoa desenhou, alguma vez. Começar pelo A ou
    // pelo H/O diz coisas diferentes sobre como se aproxima do problema.
    if (!primeiroCaractere) {
        primeiroCaractere = currentChar;
        try { localStorage.setItem(CHAVE_PRIMEIRO, primeiroCaractere); } catch (e) {}
    }
    sessao.primeiroCaractere = primeiroCaractere;

    fecharJanelaDeModo();
    sessao.segLetterpress = Math.round(tempoModo.letterpress);
    sessao.segLivre = Math.round(tempoModo.livre);
    sessao.modoFinal = isOverlapMode ? 'livre' : 'letterpress';
    sessao.trocasDeModo = acoes.trocasDeModo;
    sessao.recusas = acoes.recusas;
    sessao.undos = acoes.undos;
    sessao.preview = acoes.preview;
    sessao.expLetra = acoes.expLetra;
    sessao.expAlfabeto = acoes.expAlfabeto;
    sessao.expZip = acoes.expZip;
    sessao.expProjeto = acoes.expProjeto;

    sessao.linhas = linhasPorCaractere(t);
    sessao.modulosDetalhe = linhasPorModulo(t);
    // Uma coluna por módulo: mod_00 … mod_21, na ordem dos ficheiros. São
    // inseridas por esta ordem de propósito — percorrer o objeto directamente
    // não servia, porque o JavaScript promove chaves como "10" a índices e
    // baralha-as, e o cabeçalho da folha sai pela ordem das chaves.
    //
    // Atenção na leitura: é o estado do alfabeto no FIM desta sessão, não o
    // que foi feito nela — o alfabeto vem da sessão anterior. Para o total por
    // participante, usar a linha de numero mais alto, não somar as linhas.
    for (var q = 0; q < modules.length; q++) {
        var ficheiro = nf(q, 2);
        sessao['mod_' + ficheiro] = t.porModulo[ficheiro] || 0;
        sessao['usos_' + ficheiro] = usosAcumulados[ficheiro] || 0;
        sessao['dif_' + ficheiro] = (t.porModulo[ficheiro] || 0) - (baseSessao[ficheiro] || 0);
    }
    ultimaActividade = Date.now();
    guardarSessao();
}

// Uma linha por caractere que tenha desenho, ou que tenha mudado nesta sessão.
// Vai como registo próprio para a folha Letras: em colunas seriam 2376 numa
// linha só, e a folha deixava de servir para alguma coisa.
function linhasPorCaractere(t) {
    var linhas = [];
    var telas = listaDeTelas();
    for (var i = 0; i < telas.length; i++) {
        var c = telas[i];
        var objs = (c === currentChar) ? placedObjects
                 : (storedCharacters[c] ? storedCharacters[c].objects : []);
        var total = (objs && objs.length) ? objs.length : 0;

        var tipoC = (c === CHAVE_CARTAZ) ? 'cartaz'
                  : (c >= '0' && c <= '9') ? 'numero' : 'letra';
        var linha = { caractere: c, tipoCaractere: tipoC, total: total };
        var mudou = false;
        for (var m = 0; m < modules.length; m++) {
            var f = nf(m, 2), k = c + '|' + f;
            var agora = t.porLetra[k] || 0;
            var dif = agora - (baseLetra[k] || 0);
            linha['mod_' + f] = agora;
            linha['dif_' + f] = dif;
            linha['usos_' + f] = usosPorLetra[k] || 0;
            if (dif !== 0) mudou = true;
        }
        if (total > 0 || mudou) linhas.push(linha);
    }
    return linhas;
}

// Uma linha por módulo, com as quatro rotações. Em colunas seriam mais 88 na
// folha das sessões, que já é larga — e em linhas isto pivota-se bem.
function linhasPorModulo(t) {
    var linhas = [];
    for (var m = 0; m < modules.length; m++) {
        var f = nf(m, 2);
        var linha = {
            modulo: f,
            etiqueta: etiquetaDoModulo(m),
            total: t.porModulo[f] || 0,
            dif: (t.porModulo[f] || 0) - (baseSessao[f] || 0),
            usos: usosAcumulados[f] || 0
        };
        for (var r = 0; r < 4; r++) linha['rot_' + r] = t.porRotacao[f + '|' + r] || 0;
        linhas.push(linha);
    }
    return linhas;
}

// Separa a sessão das linhas por caractere: são folhas diferentes, e um array
// dentro de um registo chegava à folha como "[object Object]".
function despacharSessao(s) {
    if (!s || !s.desenhou) return;
    var linhas = s.linhas || [];
    var detalhe = s.modulosDetalhe || [];
    var resumo = {};
    for (var k in s) if (k !== 'linhas' && k !== 'modulosDetalhe') resumo[k] = s[k];
    enfileirarResposta(resumo);
    if (detalhe.length) {
        enfileirarResposta({
            tipo: 'modulos',
            sessaoId: s.sessaoId, participante: s.participante,
            coorte: s.coorte, numero: s.numero,
            quando: s.fim || new Date().toISOString(),
            linhas: detalhe
        });
    }
    if (linhas.length) {
        enfileirarResposta({
            tipo: 'letras',
            sessaoId: s.sessaoId,
            participante: s.participante,
            coorte: s.coorte,
            numero: s.numero,
            quando: s.fim || new Date().toISOString(),
            linhas: linhas
        });
    }
}

// pagehide dispara onde o unload já não é de fiar (Safari, iOS, bfcache).
window.addEventListener('pagehide', function () {
    if (!sessao || !sessao.desenhou) return;

    // Grava primeiro na fila — localStorage é síncrono e sobrevive ao fecho.
    // Só depois se tenta entregar. Se a entrega falhar, fica para a visita
    // seguinte em vez de se perder.
    despacharSessao(sessao);
    try { localStorage.removeItem(CHAVE_SESSAO); } catch (e) {}

    if (!ENDPOINT_RESPOSTAS) return;

    // O fetch não sobrevive ao unload; o sendBeacon foi feito para isto.
    var fila = [];
    try { fila = JSON.parse(localStorage.getItem(CHAVE_POR_ENVIAR) || '[]'); } catch (e) { return; }
    var porEnviar = [];
    for (var i = 0; i < fila.length; i++) {
        var entregue = false;
        try {
            var corpo = new Blob([JSON.stringify(fila[i])], { type: 'text/plain;charset=utf-8' });
            entregue = navigator.sendBeacon(ENDPOINT_RESPOSTAS, corpo);
        } catch (e) { entregue = false; }
        if (!entregue) porEnviar.push(fila[i]);   // demasiado grande, ou recusado
    }
    try { localStorage.setItem(CHAVE_POR_ENVIAR, JSON.stringify(porEnviar)); } catch (e) {}
});

// ===========================================================================
// AVALIAÇÃO NO FIM DA SESSÃO
// ===========================================================================
// Caracterizar quem usa a ferramenta é metade; a outra metade é saber se ela
// funcionou. Isto pergunta-o uma vez, depois de a pessoa ter mesmo trabalhado.
//
// Nunca interrompe a meio: só aparece com a pessoa parada, ou quando ela
// própria decide sair. Um questionário no meio de um traço estraga
// precisamente a experiência que se quer medir.

// --- O QUE VAIS QUERER EDITAR ---------------------------------------------

var AVALIACAO_MIN_LETRAS = 2;            // trabalho mínimo para valer a pena perguntar
var AVALIACAO_MIN_SEGUNDOS = 180;        // e tempo mínimo na sessão
var AVALIACAO_PARADO_SEGUNDOS = 45;      // quanto tempo sem mexer conta como "parou"

var PERGUNTAS_SAIDA = [
    { id: 'facilidade', tipo: 'escala',
      label: 'How easy was it to build letters from the modules?',
      extremos: ['Very hard', 'Very easy'] },
    { id: 'restricao', tipo: 'escala',
      label: 'The fixed set of modules felt…',
      extremos: ['Limiting', 'Generative'] },
    { id: 'usaria', tipo: 'escala',
      label: 'Would you use Pragmatipo in future projects or studies?',
      extremos: ['Very unlikely', 'Very likely'] },
    { id: 'comentario', tipo: 'longo', obrigatoria: false,
      label: 'Anything you would change, or that surprised you?' }
];

// --- ESTADO ----------------------------------------------------------------

var CHAVE_AVALIACAO = 'pragmatipo-avaliacao';
var avaliacaoAberta = false;
var avaliacaoVistaNestaSessao = false;
var ultimaActividade = Date.now();
var overlayAvaliacao = null;
var sairDepoisDeAvaliar = false;

// A ferramenta está trancada — pelo portão ou pela avaliação?
function interfaceBloqueada() { return !portaoAberto || avaliacaoAberta; }

function jaAvaliou() {
    try { return !!localStorage.getItem(CHAVE_AVALIACAO); } catch (e) { return false; }
}

function podePerguntarAvaliacao() {
    if (avaliacaoAberta || avaliacaoVistaNestaSessao) return false;
    if (!portaoAberto || showShortcutsModal || showWordPreview) return false;
    if (!sessao || !sessao.desenhou) return false;
    return !jaAvaliou();
}

// Corre a cada segundo. Espera por trabalho suficiente e por uma pausa.
function verificarAvaliacao() {
    if (frameCount % 60 !== 0) return;
    if (!podePerguntarAvaliacao()) return;
    // Conta letras e números: quem só desenhou dígitos trabalhou na mesma.
    if ((sessao.letras + sessao.numeros) < AVALIACAO_MIN_LETRAS) return;
    var decorridos = (Date.now() - Date.parse(sessao.inicio)) / 1000;
    if (decorridos < AVALIACAO_MIN_SEGUNDOS) return;
    if ((Date.now() - ultimaActividade) / 1000 < AVALIACAO_PARADO_SEGUNDOS) return;
    mostrarAvaliacao(false);
}

// --- O ECRÃ ----------------------------------------------------------------

function escalaDeCinco(caixa, pergunta, guardar) {
    var lbl = document.createElement('div');
    lbl.textContent = pergunta.label;
    estilo(lbl, { 'font': '700 11px \'Marist Variable\', Helvetica, Arial, sans-serif', 'color': '#555',
                  'margin': '0 0 8px' });
    caixa.appendChild(lbl);

    var fila = document.createElement('div');
    estilo(fila, { 'display': 'flex', 'gap': '6px', 'margin': '0 0 6px' });
    var botoes = [];
    for (var i = 1; i <= 5; i++) {
        (function (n) {
            var b = document.createElement('button');
            b.textContent = n;
            estilo(b, { 'flex': '1 1 0', 'padding': '11px 0', 'cursor': 'pointer',
                        'font': '700 13px \'Marist Variable\', Helvetica, Arial, sans-serif', 'color': '#555',
                        'background': '#fff', 'border': '0.75px solid #ddd',
                        'border-radius': '6px' });
            b.addEventListener('click', function () {
                guardar(n);
                botoes.forEach(function (o, idx) {
                    var sel = (idx + 1) === n;
                    estilo(o, { 'background': sel ? '#f2fff2' : '#fff',
                                'border-color': sel ? '#0a0' : '#ddd',
                                'color': sel ? '#0a0' : '#555' });
                });
            });
            fila.appendChild(b); botoes.push(b);
        })(i);
    }
    caixa.appendChild(fila);

    var extremos = document.createElement('div');
    estilo(extremos, { 'display': 'flex', 'justify-content': 'space-between',
                       'font': '400 11px \'Marist Variable\', Helvetica, Arial, sans-serif',
                       'color': '#999', 'margin': '0 0 20px' });
    var e1 = document.createElement('span'); e1.textContent = pergunta.extremos[0];
    var e2 = document.createElement('span'); e2.textContent = pergunta.extremos[1];
    extremos.appendChild(e1); extremos.appendChild(e2);
    caixa.appendChild(extremos);
}

function mostrarAvaliacao(aoSair) {
    avaliacaoAberta = true;
    avaliacaoVistaNestaSessao = true;
    sairDepoisDeAvaliar = !!aoSair;

    var ov = document.createElement('div');
    ov.id = 'pragmatipo-avaliacao';
    estilo(ov, { 'position': 'fixed', 'left': '0', 'top': '0', 'width': '100%',
                 'height': '100%', 'z-index': '2147483000',
                 'background': 'rgba(0,0,0,0.55)', 'display': 'flex',
                 'align-items': 'center', 'justify-content': 'center',
                 'overflow': 'auto', 'padding': '24px' });

    var caixa = document.createElement('div');
    estilo(caixa, { 'width': '100%', 'max-width': '480px', 'background': '#fff',
                    'border-radius': '16px', 'padding': '32px', 'box-sizing': 'border-box',
                    'font': '400 13px \'Marist Variable\', Helvetica, Arial, sans-serif', 'color': '#111',
                    'max-height': '100%', 'overflow-y': 'auto' });
    ov.appendChild(caixa);
    document.body.appendChild(ov);
    overlayAvaliacao = ov;

    // Contada a partir da lista: acrescentar perguntas não deixa a legenda a mentir.
    var numeros = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
    var quantas = numeros[PERGUNTAS_SAIDA.length] || 'A few';
    titulo(caixa, 'How did it go?',
           quantas + ' quick questions — they help the research more than you think');

    var respostas = {};
    PERGUNTAS_SAIDA.forEach(function (p) {
        if (p.tipo === 'escala') {
            escalaDeCinco(caixa, p, function (v) { respostas[p.id] = v; });
        } else {
            var lbl = document.createElement('div');
            lbl.textContent = p.label;
            estilo(lbl, { 'font': '700 11px \'Marist Variable\', Helvetica, Arial, sans-serif',
                          'color': '#555', 'margin': '0 0 8px' });
            caixa.appendChild(lbl);
            var ta = document.createElement('textarea');
            ta.rows = 3;
            estilo(ta, campoBase());
            estilo(ta, { 'resize': 'vertical', 'margin': '0 0 4px',
                         'font': '400 13px \'Marist Variable\', Helvetica, Arial, sans-serif' });
            caixa.appendChild(ta);
            respostas['_campo_' + p.id] = ta;
        }
    });

    var b = botao('Send');
    caixa.appendChild(b);

    var depois = document.createElement('div');
    depois.textContent = 'Not now';
    estilo(depois, { 'font': '400 12px \'Marist Variable\', Helvetica, Arial, sans-serif', 'color': '#999',
                     'text-align': 'center', 'margin': '14px 0 0', 'cursor': 'pointer' });
    caixa.appendChild(depois);

    b.addEventListener('click', function () {
        var registo = {
            tipo: 'avaliacao',
            participante: participante ? participante.id : null,
            coorte: participante ? participante.coorte : null,
            sessao: sessao ? sessao.numero : null,
            quando: new Date().toISOString(),
            minutos: sessao ? Math.round((Date.now() - Date.parse(sessao.inicio)) / 60000) : null,
            letras: sessao ? sessao.letras : null,
            numeros: sessao ? sessao.numeros : null,
            cartaz: sessao ? sessao.cartaz : null,
            modulos: sessao ? sessao.modulos : null
        };
        PERGUNTAS_SAIDA.forEach(function (p) {
            registo[p.id] = (p.tipo === 'escala')
                ? (respostas[p.id] || '')
                : (respostas['_campo_' + p.id].value || '').trim();
        });
        enfileirarResposta(registo);
        escoarFila();
        try { localStorage.setItem(CHAVE_AVALIACAO, '1'); } catch (e) {}
        mostrarAgradecimento(caixa);
    });

    // Adiar não é recusar: volta a aparecer numa sessão seguinte.
    depois.addEventListener('click', fecharAvaliacao);
}

function fecharAvaliacao() {
    avaliacaoAberta = false;
    if (overlayAvaliacao) { overlayAvaliacao.remove(); overlayAvaliacao = null; }
    if (sairDepoisDeAvaliar) { sairDepoisDeAvaliar = false; sairMesmo(); }
}

// Depois de responder. É também o único momento em que o participante vê o
// código dele — e é o código que lhe permite pedir a eliminação dos dados
// mais tarde, por isso não se mostra em passagem nem se fecha sozinho.
function mostrarAgradecimento(caixa) {
    titulo(caixa, 'Thank you', 'That is more useful to the research than it looks');

    var p = document.createElement('div');
    p.textContent = 'Your answers go into a doctoral study on modular letterpress ' +
                    'type systems. Nothing you drew has been sent anywhere — only ' +
                    'the answers and a count of what you made.';
    estilo(p, { 'font': '400 12px \'Marist Variable\', Helvetica, Arial, sans-serif', 'color': '#555',
                'line-height': '1.55', 'margin': '0 0 22px' });
    caixa.appendChild(p);

    var rotulo = document.createElement('div');
    rotulo.textContent = 'Your anonymous code';
    estilo(rotulo, { 'font': '700 11px \'Marist Variable\', Helvetica, Arial, sans-serif',
                     'color': '#555', 'margin': '0 0 6px' });
    caixa.appendChild(rotulo);

    var codigo = document.createElement('div');
    codigo.textContent = participante ? participante.id : '—';
    estilo(codigo, { 'font': '700 20px \'Marist Variable\', Helvetica, Arial, sans-serif', 'color': '#0a0',
                     'letter-spacing': '1px', 'text-align': 'center',
                     'background': '#f2fff2', 'border': '0.75px solid #0a0',
                     'border-radius': '6px', 'padding': '14px', 'margin': '0 0 10px',
                     'user-select': 'all' });
    caixa.appendChild(codigo);

    var nota = document.createElement('div');
    estilo(nota, { 'font': '400 12px \'Marist Variable\', Helvetica, Arial, sans-serif', 'color': '#888',
                   'line-height': '1.55', 'margin': '0 0 4px' });
    nota.appendChild(document.createTextNode('Write it down if you may want your data removed later. Send it to '));
    var lnk = document.createElement('a');
    lnk.href = 'mailto:' + EMAIL_CONTACTO + '?subject=' +
               encodeURIComponent('Pragmatipo — remove my data');
    lnk.textContent = EMAIL_CONTACTO;
    estilo(lnk, { 'color': '#0a0', 'text-decoration': 'underline' });
    nota.appendChild(lnk);
    nota.appendChild(document.createTextNode(' and it is deleted.'));
    caixa.appendChild(nota);

    var b = botao(sairDepoisDeAvaliar ? 'Back to the site' : 'Back to drawing');
    caixa.appendChild(b);
    b.addEventListener('click', fecharAvaliacao);
}

// ===========================================================================
// MENUS DE EXPORTAR E LIMPAR
// ===========================================================================
// Sete botões só de ícone no canto — três deles documentos quase iguais — não
// conseguiam dizer se exportavam uma letra, o alfabeto ou um ZIP. Só palavras
// dizem isso. E o que não se aplica ao modo actual desaparece do menu, em vez
// de ficar um ícone pálido que ninguém sabe se está desligado ou mal desenhado.
//
// O gatilho continua desenhado no canvas, como os restantes botões; só a lista
// é HTML, para ter texto a sério e comportamento de menu.

var btnExport = { x: 0, y: 0, w: 0, h: 0 };
var btnClear = { x: 0, y: 0, w: 0, h: 0 };
var btnImport = { x: 0, y: 0, w: 0, h: 0 };
var menuAberto = null;
var menuDeQuem = null;

// Gatilho de menu: texto e uma seta, no mesmo estilo dos outros botões.
// O vermelho fica reservado ao Clear, que é o destrutivo.
function desenharBotaoMenu(b, texto, aberto, perigo, temSeta) {
    var sobre = !showShortcutsModal && dentroDe(b);
    var activo = aberto || sobre;
    push();
    rectMode(CENTER); textAlign(CENTER, CENTER);
    if (perigo) {
        fill(activo ? [255, 200, 200] : [255, 235, 235]);
        stroke(activo ? [255, 50, 50] : [255, 205, 205]);
    } else {
        fill(activo ? [220, 255, 220] : 249);
        stroke(activo ? [0, 150, 0] : 238);
    }
    strokeWeight(0.75);
    rect(b.x, b.y, b.w, b.h, 6 * globalScale);

    noStroke();
    fill(perigo ? [200, 40, 40] : (activo ? [0, 130, 0] : 110));
    textSize(11 * globalScale); textStyle(BOLD);
    text(texto, b.x - (temSeta ? 7 * globalScale : 0), b.y);
    textStyle(NORMAL);

    if (!temSeta) { pop(); return; }

    // seta
    var sx = b.x + b.w / 2 - 14 * globalScale, sy = b.y;
    var d = 3.2 * globalScale;
    stroke(perigo ? [200, 40, 40] : (activo ? [0, 130, 0] : 110));
    strokeWeight(1.2 * globalScale); noFill();
    line(sx - d, sy - d / 2, sx, sy + d / 2);
    line(sx, sy + d / 2, sx + d, sy - d / 2);
    pop();
}

function fecharMenu() {
    if (menuAberto) { menuAberto.remove(); menuAberto = null; }
    menuDeQuem = null;
}

function abrirMenu(quem, itens, direita, topo) {
    fecharMenu();
    var m = document.createElement('div');
    m.id = 'pragmatipo-menu';
    // Sem largura mínima: em position:fixed o bloco encolhe ao conteúdo, e o
    // nowrap das linhas garante que nada parte. Assim não sobra espaço à direita.
    estilo(m, {
        'position': 'fixed', 'top': Math.round(topo) + 'px', 'left': '0px',
        'background': '#fff', 'border': '0.75px solid #ddd',
        'border-radius': '8px', 'padding': '5px', 'box-sizing': 'border-box',
        'box-shadow': '0 8px 28px rgba(0,0,0,0.13)', 'z-index': '2147482000',
        'font': '400 12.5px ' + PILHA_DE_FONTES, 'color': '#111'
    });

    itens.forEach(function (it) {
        if (it.separador) {
            var hr = document.createElement('div');
            estilo(hr, { 'height': '1px', 'background': '#eee', 'margin': '5px 4px' });
            m.appendChild(hr);
            return;
        }
        var linha = document.createElement('div');
        estilo(linha, {
            'display': 'flex', 'align-items': 'center', 'gap': '10px',
            'padding': '8px 10px', 'border-radius': '5px', 'cursor': 'pointer',
            'color': it.perigo ? '#c00' : '#111', 'white-space': 'nowrap'
        });
        // Os SVG vêm da pasta data, os mesmos que a barra usa. Nos destrutivos
        // ficam avermelhados por filtro, para acompanharem o texto.
        if (it.icone) {
            var img = document.createElement('img');
            img.src = BASE_PATH + it.icone;
            img.alt = '';
            estilo(img, { 'width': '17px', 'height': '17px', 'flex': '0 0 auto',
                          'opacity': it.perigo ? '1' : '0.72',
                          'filter': it.perigo ? 'invert(24%) sepia(88%) saturate(4000%) hue-rotate(354deg)' : 'none' });
            linha.appendChild(img);
        }
        var rotulo = document.createElement('span');
        rotulo.textContent = it.texto;
        linha.appendChild(rotulo);
        linha.addEventListener('mouseenter', function () {
            estilo(linha, { 'background': it.perigo ? '#ffeaea' : '#f2fff2' });
        });
        linha.addEventListener('mouseleave', function () {
            estilo(linha, { 'background': 'transparent' });
        });
        linha.addEventListener('click', function () { fecharMenu(); it.accao(); });
        m.appendChild(linha);
    });

    // O p5 escuta o mousedown na janela: sem isto, o rato-a-descer fechava o
    // menu e marcava mouseIsPressed antes de o clique chegar ao item — o menu
    // não reagia e a peça ia parar ao artboard por baixo.
    m.addEventListener('mousedown', function (e) { e.stopPropagation(); e.preventDefault(); });

    document.body.appendChild(m);
    menuAberto = m;
    menuDeQuem = quem;

    // Alinhado pela DIREITA com o botão. O gatilho está encostado à margem
    // direita: alinhar pela esquerda mandava o menu para fora do ecrã e o
    // travão de segurança desencostava-o do botão. Só se pode medir depois de
    // estar no documento, porque a largura vem do conteúdo.
    var largura = m.getBoundingClientRect().width;
    var esquerda = direita - largura;
    esquerda = max(6, min(esquerda, window.innerWidth - largura - 6));
    estilo(m, { 'left': Math.round(esquerda) + 'px' });
}

function itensExportar() {
    var itens = [];
    itens.push({ texto: modoCartaz ? 'Export poster (SVG)' : 'Export letter (SVG)',
                 icone: 'exportar-letra.svg',
                 accao: function () { exportCharacterSVG(currentChar); } });
    // Sem alfabeto no modo cartaz: em vez de esmorecer, não aparece.
    if (!modoCartaz) {
        itens.push({ texto: 'Export alphabet (SVG)', icone: 'exportar-alfabeto.svg', accao: exportAlphabetSVG });
        itens.push({ texto: 'Export alphabet (ZIP)', icone: 'exportar-zip.svg', accao: exportAlphabetZIP });
    }
    itens.push({ separador: true });
    itens.push({ texto: 'Save project (JSON)', icone: 'guardar.svg', accao: exportProjectJSON });
    return itens;
}

function itensLimpar() {
    var itens = [{
        texto: modoCartaz ? 'Clear poster' : 'Clear this artboard',
        perigo: true, icone: 'limpar-letra.svg',
        accao: function () {
            saveHistory(); placedObjects = []; selectedObjects = []; rebuildCollisionMap();
        }
    }];
    if (!modoCartaz) {
        itens.push({ texto: 'Clear entire alphabet', perigo: true,
                     icone: 'limpar-alfabeto.svg', accao: clearEntireAlphabet });
    }
    return itens;
}
