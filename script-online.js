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

    for (var i = 0; i < 21; i++) {
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
    var cnv = createCanvas(windowWidth, windowHeight);
    forceCanvasLayout(cnv);
    rectMode(CENTER);
    imageMode(CENTER);
    strokeWeight(0.5);
    textSize(8);
    textAlign(CENTER, CENTER);
    angleMode(DEGREES);

    collisionMap = createCollisionMap();

    for (var i = 0; i < 21; i++) {
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

    aplicarTipoDeLetraDoSite();
    mostrarManualNaPrimeiraVisita();
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
    var idealTotalWidth = 1145;
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
        
        strokeWeight(0.5); // Fica mais profissional e elegante
        rectMode(CORNERS);
        rect(snapStartX, snapStartY, snapEndX, snapEndY);
        pop();
    }

    handleInteraction();
    drawCustomCursor(); // desenhado ANTES da UI para os fantasmas ficarem por baixo dos painéis
    drawUI();

    drawShortcutsModal();

    // Contador de módulos da letra atual (canto inferior direito)
    push(); noStroke(); fill(120); textAlign(RIGHT, BOTTOM); textSize(11);
    text('modules: ' + placedObjects.length, width - 8, height - 8);
    pop();
}

function handleInteraction() {
    // Bloqueia qualquer desenho se o pop-up estiver aberto!
    if (showShortcutsModal) return;

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

function mousePressed() {
    if (mouseButton == LEFT) {
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
                isOverlapMode = false;
                return;
            }
            if (mouseX > btnStencil.x - btnStencil.w / 2 && mouseX < btnStencil.x + btnStencil.w / 2 && mouseY > btnStencil.y - btnStencil.h / 2 && mouseY < btnStencil.y + btnStencil.h / 2) {
                isOverlapMode = true;
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
            checkSidebarClick();
        }
        else {
            if (keyIsDown(32) || selectedModule === -3) return;
            if (showGuides) {
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
                }
            }
        }
    }

    // ADICIONAR ESTA LINHA NO FINAL DA FUNÇÃO:
    return false; // Bloqueia o navegador de iniciar a seleção nativa

}

function mouseReleased() {
    if (isDraggingSlider) { isDraggingSlider = false; return; } // Liberta o slider

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
    { len: 3, wid: 2 }     // 20 <-- NOVO MÓDULO 20
];

function getModuleDims(id) {
    return MODULE_DIMS[id] || { len: (id + 1) * 2, wid: 2 };
}

function isCurveGroup(id) { return id >= 6 && id <= 11; }
function isArchGroup(id) { return id >= 12 && id <= 14; }
function isDiagonalGroup(id) { return id >= 16 && id <= 20; } // <-- Atualizado para 20
function hasGeneticMap(id) { return (id >= 0 && id <= 20); }  // <-- Atualizado para 20

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
    /* 20 */[['Y', 'Y', 'B'], ['B', 'Y', 'Y']]  // <-- ADN DO 20 (Amarelo e Azul)
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
        saveHistory();
        for (var i = 0; i < groupToTest.length; i++) {
            placedObjects.push(groupToTest[i]);
            addObjToCollisionMap(groupToTest[i]);
        }
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
    push(); stroke(238); strokeWeight(0.5); noFill();
    rect(gridStartX, gridStartY, gridPixW, gridPixH); pop();

    // 1. Grelha Fina (Linhas ou Pontos)
    if (showSmallGrid) {
        push();
        if (currentGridStyle === 'lines') {
            strokeWeight(0.5); stroke(238); drawingContext.setLineDash([4, 4]);

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
            fill(210); noStroke(); // Cor do círculo

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
    if (showGuides) {
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
            stroke(colY[0], colY[1], colY[2]); strokeWeight(0.5); drawingContext.setLineDash([8, 4]); line(sidebarWidth, screenY, width, screenY); drawingContext.setLineDash([]);
            noStroke(); fill(colY[0], colY[1], colY[2]); textAlign(LEFT, BOTTOM); textSize(9); text(labels[keyY], sidebarWidth + 10, screenY - 2);
        }

        for (var keyX in guidesX) {
            var screenX = centerX + (guidesX[keyX] - GRID_CX) * tileSize;
            var colX = guideColors[keyX];
            stroke(colX[0], colX[1], colX[2]); strokeWeight(0.5); drawingContext.setLineDash([8, 4]); line(screenX, topBarHeight, screenX, height); drawingContext.setLineDash([]);
            noStroke(); fill(colX[0], colX[1], colX[2]); textAlign(LEFT, TOP); textSize(9); text(labels[keyX], screenX + 5, topBarHeight + 10);
        }
    }

    if (showCenterV) { push(); stroke(200, 50, 255, 180); strokeWeight(0.5); drawingContext.setLineDash([10, 5]); line(centerX, topBarHeight, centerX, height); pop(); }
    if (showCenterH) { push(); stroke(200, 50, 255, 180); strokeWeight(0.5); drawingContext.setLineDash([10, 5]); line(sidebarWidth, centerY, width, centerY); pop(); }

    if (isMirrorModeV || isMirrorModeH) {
        stroke(255, 50, 50, 180); strokeWeight(0.5); drawingContext.setLineDash([5, 5]);
        if (isMirrorModeV) line(centerX, topBarHeight, centerX, height);
        if (isMirrorModeH) line(sidebarWidth, centerY, width, centerY);
        drawingContext.setLineDash([]);
        noStroke(); fill(255, 50, 50, 180); textSize(9);
        if (isMirrorModeV) { textAlign(LEFT, TOP); text("VERTICAL SYMMETRY", centerX + 10, topBarHeight + 15); }
        if (isMirrorModeH) { textAlign(RIGHT, BOTTOM); text("HORIZONTAL SYMMETRY", width - 15, centerY - 5); }
    }

    rectMode(CENTER);
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
    if (showShortcutsModal) { cursor(ARROW); return; } // <-- ADICIONE ESTA LINHA AQUI!

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

    // 1. Vai buscar a caixa que contém o alfabeto inteiro
    var bounds = getGlobalBounds();
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
            if (i == 8) { showGuides = !showGuides; return; }
            if (i == 9) { fitToScreen(); return; }
            if (i == 10) { undo(); return; }
            if (i == 11) { redo(); return; }
        }
    }

    // 2. Clique Linha 2: Módulos
    for (var i = 0; i < modules.length; i++) {
        var mx = toolStartX + (i * toolGapX);
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
    var idsRow1 = ["importar", "guardar", "eliminar", "eliminarAlfa"];
    for (var j = 0; j < idsRow1.length; j++) {
        var rx = rightMargin - (idsRow1.length - 1 - j) * toolGapX;
        if (mouseX > rx - tBoxSize / 2 && mouseX < rx + tBoxSize / 2 && mouseY > ty - tBoxSize / 2 && mouseY < ty + tBoxSize / 2) {
            if (idsRow1[j] === "importar") importProjectJSON();
            if (idsRow1[j] === "guardar") exportProjectJSON();
            if (idsRow1[j] === "eliminar") { saveHistory(); placedObjects = []; selectedObjects = []; rebuildCollisionMap(); }
            if (idsRow1[j] === "eliminarAlfa") clearEntireAlphabet();
            return;
        }
    }
    var idsRow2 = ["letra", "alfa", "zip"];
    for (var j = 0; j < idsRow2.length; j++) {
        var rx = rightMargin - (idsRow2.length - 1 - j) * toolGapX;
        if (mouseX > rx - tBoxSize / 2 && mouseX < rx + tBoxSize / 2 && mouseY > my - tBoxSize / 2 && mouseY < my + tBoxSize / 2) {
            if (idsRow2[j] === "letra") exportCharacterSVG(currentChar);
            if (idsRow2[j] === "alfa") exportAlphabetSVG();
            if (idsRow2[j] === "zip") exportAlphabetZIP();
            return;
        }
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

    var charStartY = topBarHeight + 30 * globalScale - alphabetScrollY;

    for (var i = 0; i < characters.length; i++) {
        var col = i % charCols;
        var row = floor(i / charCols);
        var x = charStartX + (col * charGapX);
        var y = charStartY + (row * charGapY);

        // Verificamos o clique respeitando a base virtual (effectiveBottom)
        if (mouseY > topBarHeight && mouseY < effectiveBottom - bottomPanelH) {
            if (mouseX > x - cSize / 2 && mouseX < x + cSize / 2 && mouseY > y - cSize / 2 && mouseY < y + cSize / 2) {
                switchCharacter(characters[i]);
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
    stroke(238); strokeWeight(0.5); line(0, topBarHeight, width, topBarHeight); pop();

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
        { img: toolIcons.guias, active: showGuides, color: [200, 100, 150], tip: "Typographic Guides" },
        { img: toolIcons.enquadrar, active: false, color: [100, 100, 100], tip: "Fit to Screen" },
        { img: toolIcons.voltar, active: false, color: [100, 100, 100], tip: "Undo" },
        { img: toolIcons.avancar, active: false, color: [100, 100, 100], tip: "Redo" }
    ];

    rectMode(CENTER); imageMode(CENTER);
    for (var i = 0; i < toolsList.length; i++) {
        var tx = toolStartX + (i * toolGapX);
        var t = toolsList[i];
        var isH = (mouseX > tx - tBoxSize / 2 && mouseX < tx + tBoxSize / 2 && mouseY > ty - tBoxSize / 2 && mouseY < ty + tBoxSize / 2);
        if (isH) { activeTooltip = t.tip; tooltipX = tx; tooltipY = ty + tBoxSize / 2 + 15 * globalScale; }
        fill(t.active ? color(t.color[0], t.color[1], t.color[2], 30) : (isH ? 235 : 249));
        stroke(t.active ? color(t.color[0], t.color[1], t.color[2]) : 200);
        strokeWeight(0.5); rect(tx, ty, tBoxSize, tBoxSize, 6 * globalScale);
        if (t.img) { tint(t.active ? color(t.color[0], t.color[1], t.color[2]) : (isH ? 40 : 80)); image(t.img, tx, ty, 20 * globalScale, 20 * globalScale); noTint(); }
    }

    // --- SLIDER E ROTAÇÃO (LINHA 1) ---
    var sliderBoxCX = toolStartX + (14 * toolGapX);
    var sliderBoxW = (4 * toolGapX) + tBoxSize;
    fill(250); stroke(238); strokeWeight(0.5);
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

    var isHoverSlider = !showShortcutsModal && (mouseX > uiSlider.x - 10 && mouseX < uiSlider.x + uiSlider.w + 10 && mouseY > ty - 15 && mouseY < ty + 15);

    // Bolinha
    fill(0, 200, 0);
    if (isHoverSlider || isDraggingSlider) { stroke(140, 225, 140); strokeWeight(0.5); } else { noStroke(); }
    circle(thumbX, trackY, 12 * globalScale);

    if (isHoverSlider || isDraggingSlider) {
        activeTooltip = "Scale: " + tileSize;
        tooltipX = sliderBoxCX; tooltipY = ty + tBoxSize / 2 + 15 * globalScale;
    }

    // A CAIXA DA ROTAÇÃO (Mantém-se igual)
    var rotBoxW = (2 * toolGapX) + tBoxSize;
    var rotBoxCX = toolStartX + (18 * toolGapX);
    fill(250); stroke(238); strokeWeight(0.5); rect(rotBoxCX, ty, rotBoxW, tBoxSize, 6 * globalScale);

    noStroke();
    var hasActiveModule = (selectedModule >= 0 || selectedModule == -2);
    fill(hasActiveModule ? [0, 200, 0] : 150); textAlign(CENTER, CENTER); textSize(10 * globalScale); textStyle(BOLD);
    text(hasActiveModule ? "ROTATION: " + (currentRotation * 90) + "º" : "ROTATION: --", rotBoxCX, ty);
    textStyle(NORMAL);

    // --- LINHA 2: MÓDULOS ---
    for (var i = 0; i < modules.length; i++) {
        var mx = toolStartX + (i * toolGapX);
        var isH = (mouseX > mx - tBoxSize / 2 && mouseX < mx + tBoxSize / 2 && mouseY > my - tBoxSize / 2 && mouseY < my + tBoxSize / 2);
        if (isH) { activeTooltip = nf(i, 2); tooltipX = mx; tooltipY = my + tBoxSize / 2 + 15 * globalScale; }
        fill(selectedModule == i ? [215, 245, 210] : (isH ? 235 : 250));
        stroke(selectedModule == i ? [0, 200, 0] : 220);
        strokeWeight(0.5); rect(mx, my, tBoxSize, tBoxSize, 6 * globalScale);
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
    var row1R = [{ id: "importar", img: toolIcons.importar, tip: "Import Project" }, { id: "guardar", img: toolIcons.guardar, tip: "Save Project" }, { id: "eliminar", img: toolIcons.limparLetra, isDestructive: true, tip: "Clear Artboard" }, { id: "eliminarAlfa", img: toolIcons.limparAlfabeto, isDestructive: true, tip: "Clear Alphabet" }];
    for (var j = 0; j < row1R.length; j++) {
        var rx = rightMargin - (row1R.length - 1 - j) * toolGapX;
        var isH = (mouseX > rx - tBoxSize / 2 && mouseX < rx + tBoxSize / 2 && mouseY > ty - tBoxSize / 2 && mouseY < ty + tBoxSize / 2);
        if (isH) { activeTooltip = row1R[j].tip; tooltipX = rx; tooltipY = ty + tBoxSize / 2 + 15 * globalScale; }
        fill(row1R[j].isDestructive ? (isH ? [255, 200, 200] : [255, 230, 230]) : (isH ? 235 : 255));
        stroke(row1R[j].isDestructive ? [255, 50, 50] : 200); strokeWeight(0.5); rect(rx, ty, tBoxSize, tBoxSize, 6 * globalScale);
        if (row1R[j].img) { tint(row1R[j].isDestructive ? [255, 50, 50] : (isH ? 40 : 80)); image(row1R[j].img, rx, ty, 20 * globalScale, 20 * globalScale); noTint(); }
    }
    var row2R = [{ id: "letra", img: toolIcons.exportarLetra, tip: "Export letter SVG" }, { id: "alfa", img: toolIcons.exportarAlfabeto, tip: "Export alphabet SVG" }, { id: "zip", img: toolIcons.exportarZip, tip: "Export alphabet ZIP" }];
    for (var j = 0; j < row2R.length; j++) {
        var rx = rightMargin - (row2R.length - 1 - j) * toolGapX;
        var isH = (mouseX > rx - tBoxSize / 2 && mouseX < rx + tBoxSize / 2 && mouseY > my - tBoxSize / 2 && mouseY < my + tBoxSize / 2);
        if (isH) { activeTooltip = row2R[j].tip; tooltipX = rx; tooltipY = my + tBoxSize / 2 + 15 * globalScale; }
        fill(isH ? [220, 255, 220] : 255); stroke(isH ? [0, 150, 0] : 200); strokeWeight(0.5); rect(rx, my, tBoxSize, tBoxSize, 6 * globalScale);
        if (row2R[j].img) { tint(isH ? 40 : 80); image(row2R[j].img, rx, my, 20 * globalScale, 20 * globalScale); noTint(); }
    }

    // --- BARRA LATERAL (ALFABETO EM SCROLL) ---
    fill(249); noStroke(); rectMode(CORNER); rect(0, topBarHeight, sidebarWidth, height - topBarHeight);
    var charGapY = 45 * globalScale; var cSize = 34 * globalScale; var bottomPanelH = 150 * globalScale;
    var minSafeHeight = topBarHeight + bottomPanelH + (50 * globalScale);
    var effectiveBottom = max(height, minSafeHeight);

    var availableHForChars = effectiveBottom - topBarHeight - bottomPanelH;
    var charRows = Math.ceil(characters.length / 3);
    var maxScroll = max(0, (charRows * charGapY + 20 * globalScale) - availableHForChars);
    alphabetScrollY = constrain(alphabetScrollY, 0, maxScroll);
    var charStartY = topBarHeight + 30 * globalScale - alphabetScrollY;

    push(); drawingContext.save(); drawingContext.beginPath(); drawingContext.rect(0, topBarHeight, sidebarWidth, availableHForChars); drawingContext.clip();
    textSize(12 * globalScale); textStyle(NORMAL); rectMode(CENTER);
    for (var i = 0; i < characters.length; i++) {
        var col = i % 3; var row = floor(i / 3); var x = toolStartX + (col * toolGapX); var y = charStartY + (row * charGapY);
        if (y > topBarHeight - cSize && y < effectiveBottom - bottomPanelH + cSize) {
            var isH = (mouseX > x - cSize / 2 && mouseX < x + cSize / 2 && mouseY > y - cSize / 2 && mouseY < y + cSize / 2 && mouseY > topBarHeight && mouseY < effectiveBottom - bottomPanelH);
            if (characters[i] == currentChar) { fill(220); stroke(0); strokeWeight(0.5); } else if (isH) { fill(235); stroke(180); strokeWeight(0.5); } else { fill(249); stroke(238); strokeWeight(0.5); }
            rect(x, y, cSize, cSize, 4 * globalScale);
            if (isGridEmpty(characters[i])) { noStroke(); fill(characters[i] == currentChar ? 0 : (isH ? 80 : 150)); text(characters[i], x, y); } else { drawThumbnail(characters[i], x - cSize / 2 + 2 * globalScale, y - cSize / 2 + 2 * globalScale, cSize - 4 * globalScale); }
        }
    }
    drawingContext.restore(); pop();

    // --- RODAPÉ FIXO DE CONFIGURAÇÕES ---
    fill(249); noStroke(); rectMode(CORNER); rect(0, effectiveBottom - bottomPanelH, sidebarWidth, bottomPanelH);
    stroke(238); strokeWeight(0.5); line(0, effectiveBottom - bottomPanelH, sidebarWidth, effectiveBottom - bottomPanelH);

    var btnW_largo = (2 * toolGapX) + cSize; var btnH = 34 * globalScale; var btnX_centro = toolStartX + toolGapX;

    // Posicionamento
    btnLetterpress.x = btnX_centro; btnLetterpress.y = effectiveBottom - 115 * globalScale; btnLetterpress.w = btnW_largo; btnLetterpress.h = btnH;
    btnStencil.x = btnX_centro; btnStencil.y = effectiveBottom - 70 * globalScale; btnStencil.w = btnW_largo; btnStencil.h = btnH;
    btnAtalhos.w = btnH; btnAtalhos.h = btnH; btnAtalhos.x = toolStartX; btnAtalhos.y = effectiveBottom - 25 * globalScale;
    btnFlip.w = btnH; btnFlip.h = btnH; btnFlip.x = toolStartX + toolGapX; btnFlip.y = effectiveBottom - 25 * globalScale;
    btnHome.w = btnH; btnHome.h = btnH; btnHome.x = toolStartX + 2 * toolGapX; btnHome.y = effectiveBottom - 25 * globalScale;

    textSize(9.5 * globalScale); textStyle(BOLD); rectMode(CENTER);

    var isOffH = (mouseX > btnLetterpress.x - btnLetterpress.w / 2 && mouseX < btnLetterpress.x + btnLetterpress.w / 2 && mouseY > btnLetterpress.y - btnLetterpress.h / 2 && mouseY < btnLetterpress.y + btnLetterpress.h / 2);
    fill(!isOverlapMode ? [0, 200, 0, 30] : (isOffH ? 235 : 255)); stroke(!isOverlapMode ? [0, 200, 0] : 200); strokeWeight(0.5);
    rect(btnLetterpress.x, btnLetterpress.y, btnLetterpress.w, btnLetterpress.h, 6 * globalScale);
    noStroke(); fill(!isOverlapMode ? [0, 200, 0] : 150); text("Letterpress mode", btnLetterpress.x, btnLetterpress.y);

    var isOnH = (mouseX > btnStencil.x - btnStencil.w / 2 && mouseX < btnStencil.x + btnStencil.w / 2 && mouseY > btnStencil.y - btnStencil.h / 2 && mouseY < btnStencil.y + btnStencil.h / 2);
    fill(isOverlapMode ? [0, 200, 0, 30] : (isOnH ? 235 : 255)); stroke(isOverlapMode ? [0, 200, 0] : 200); strokeWeight(0.5);
    rect(btnStencil.x, btnStencil.y, btnStencil.w, btnStencil.h, 6 * globalScale);
    noStroke(); fill(isOverlapMode ? [0, 200, 0] : 150); text("Free mode", btnStencil.x, btnStencil.y);

    var isAtH = !showShortcutsModal && (mouseX > btnAtalhos.x - btnAtalhos.w / 2 && mouseX < btnAtalhos.x + btnAtalhos.w / 2 && mouseY > btnAtalhos.y - btnAtalhos.h / 2 && mouseY < btnAtalhos.y + btnAtalhos.h / 2);
    fill(showShortcutsModal ? 220 : (isAtH ? 235 : 255)); stroke(showShortcutsModal ? 0 : 200); strokeWeight(0.5);
    rect(btnAtalhos.x, btnAtalhos.y, btnAtalhos.w, btnAtalhos.h, 6 * globalScale);
    if (toolIcons.atalhos) { tint(isAtH ? 40 : 80); image(toolIcons.atalhos, btnAtalhos.x, btnAtalhos.y, 20 * globalScale, 20 * globalScale); noTint(); }

    // BOTÃO FLIP (Espelhar)
    var isFlipH = !isOverlapMode && !showShortcutsModal && (mouseX > btnFlip.x - btnFlip.w / 2 && mouseX < btnFlip.x + btnFlip.w / 2 && mouseY > btnFlip.y - btnFlip.h / 2 && mouseY < btnFlip.y + btnFlip.h / 2);
    push();
    if (isOverlapMode) { fill(249, 249, 249, 150); stroke(220, 150); } // CORRIGIDO AQUI
    else { fill(isFlipH ? 235 : 255); stroke(238); }
    strokeWeight(0.5); rect(btnFlip.x, btnFlip.y, btnFlip.w, btnFlip.h, 6 * globalScale);
    noStroke(); fill(isOverlapMode ? 180 : 100); textAlign(CENTER, CENTER); textSize(9 * globalScale); textStyle(BOLD); text("FLIP", btnFlip.x, btnFlip.y);
    pop();

    // BOTÃO HOME (Voltar ao site) — seta desenhada à mão, sem SVG novo
    var isHomeH = !showShortcutsModal && (mouseX > btnHome.x - btnHome.w / 2 && mouseX < btnHome.x + btnHome.w / 2 && mouseY > btnHome.y - btnHome.h / 2 && mouseY < btnHome.y + btnHome.h / 2);
    push();
    fill(isHomeH ? 235 : 255); stroke(238); strokeWeight(0.5);
    rect(btnHome.x, btnHome.y, btnHome.w, btnHome.h, 6 * globalScale);
    stroke(isHomeH ? 40 : 100); strokeWeight(0.5); noFill();
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

    stroke(238); strokeWeight(0.5); line(sidebarWidth, topBarHeight, sidebarWidth, effectiveBottom);

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

    { t: 'h', s: 'Redo', ic: 'avancar' },
    { t: 'li', s: 'Step forward through the last 15 actions' },

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
    fill(255); stroke(238); strokeWeight(0.5);
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
            stroke(232); strokeWeight(0.5);
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
            fill(236, 250, 236); stroke(184, 224, 184); strokeWeight(0.5);
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
    stroke(230); strokeWeight(0.5); line(left + padX, top + headerH, left + b.w - padX, top + headerH);
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

function keyPressed() {
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
    if (key == 'A' && keyIsDown(SHIFT)) exportAlphabetSVG();
    if (key == 'Z' && keyIsDown(SHIFT)) exportAlphabetZIP();

    if (keyCode == DELETE || keyCode == BACKSPACE) {
        if ((selectedModule === -2 || selectedModule === -1) && selectedObjects.length > 0) {
            saveHistory();
            for (var s = 0; s < selectedObjects.length; s++) {
                var groupToDelete = getMirroredGroup(selectedObjects[s]);
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
            selectedObjects = [];
        }
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

function revolveGroup(group) {
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
        var newX = cx - (o.y - cy);
        var newY = cy + (o.x - cx);
        o.x = newX;
        o.y = newY;
        o.rot = (o.rot + 1) % 4;
    }
}

function rotateSelectedObjects() {
    if (selectedObjects.length === 0) return;
    saveHistory();

    // Remove temporariamente da grelha
    for (var i = 0; i < selectedObjects.length; i++) {
        var idx = placedObjects.indexOf(selectedObjects[i]);
        if (idx > -1) placedObjects.splice(idx, 1);
        removeObjFromCollisionMap(selectedObjects[i]);
    }

    // Clona e roda
    var groupToTest = JSON.parse(JSON.stringify(selectedObjects));
    revolveGroup(groupToTest);

    // Expande para incluir os espelhos visuais ativos
    var fullGroupToTest = [];
    for (var k = 0; k < groupToTest.length; k++) {
        var mirrors = getMirroredGroup(groupToTest[k]);
        for (var m = 0; m < mirrors.length; m++) {
            if (!containsObj(fullGroupToTest, mirrors[m])) {
                fullGroupToTest.push(mirrors[m]);
            }
        }
    }

    // Testa se a nova rotação cabe no espaço
    if (checkPlacementValidGroup(fullGroupToTest)) {
        selectedObjects = [];
        for (var i = 0; i < fullGroupToTest.length; i++) {
            placedObjects.push(fullGroupToTest[i]);
            addObjToCollisionMap(fullGroupToTest[i]);
        }
        selectedObjects = fullGroupToTest.slice(0, groupToTest.length);
    } else {
        // Reverte se bater nalguma peça vizinha
        for (var i = 0; i < selectedObjects.length; i++) {
            placedObjects.push(selectedObjects[i]);
            addObjToCollisionMap(selectedObjects[i]);
        }
    }
}

function exportProjectJSON() {
    // 1. GUARDA O ESTADO ATUAL (A linha mágica que faltava!)
    saveCharacter(currentChar);

    // 2. Prepara o "pacote" com a memória atual do alfabeto
    var projectData = {
        version: "1.0",
        appName: "Plataforma Modular Tipográfica",
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
    if (charToExport === currentChar) {
        saveCharacter(currentChar);
    }

    var objs = storedCharacters[charToExport] ? storedCharacters[charToExport].objects : [];

    if (!objs || objs.length === 0) {
        avisar("The letter '" + charToExport + "' is empty! There is nothing to export.");
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
        svgStr += '  <!-- Módulo ' + nf(o.type, 2) + ' -->\n';
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
    a.download = "Letra_" + charToExport + "_Vetores.svg";

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

                svgStr += '  <!-- Módulo ' + nf(o.type, 2) + ' -->\n';
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
    fill(249); stroke(238); strokeWeight(0.5);
    rect(cx, cy, w, h, 6 * globalScale);

    for (var i = 0; i < options.length; i++) {
        var segCX = startX + (i * segW) + (segW / 2);
        var isHover = (mouseX > startX + i * segW && mouseX < startX + (i + 1) * segW && mouseY > cy - h / 2 && mouseY < cy + h / 2);

        // Fundo do "Botão" selecionado
        if (i === selectedIdx) {
            fill(255); stroke(238); strokeWeight(0.5);
            rect(segCX, cy, segW - 4 * globalScale, h - 4 * globalScale, 4 * globalScale);
        } else if (isHover && !showShortcutsModal) {
            fill(235); noStroke();
            rect(segCX, cy, segW - 4 * globalScale, h - 4 * globalScale, 4 * globalScale);
        }

        // Linhas Divisórias
        if (i > 0) {
            stroke(238); strokeWeight(0.5);
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
    for (var i = 0; i < characters.length; i++) {
        var store = storedCharacters[characters[i]];
        if (store && store.objects.length > 0) return true;
    }
    return false;
}

function goToSite() {
    if (hasUnsavedWork()) {
        var leave = perguntar("You have work on the canvas that isn't saved.\n\nLeaving now will discard it — use \"Save project (JSON)\" first if you want to keep it.\n\nLeave anyway?");
        if (!leave) return;
    }
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
