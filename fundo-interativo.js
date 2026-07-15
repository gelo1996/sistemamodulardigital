window.addEventListener('DOMContentLoaded', () => {
    const githubBaseUrl = "https://cdn.jsdelivr.net/gh/gelo1996/sistemamodulardigital@main/data";

    const Engine = Matter.Engine,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite;

    const engine = Engine.create({ enableSleeping: true });
    const world = engine.world;

    const meusSVGs = [
        "00.svg", "01.svg", "02.svg", "03.svg", "04.svg", "05.svg", "06.svg", 
        "07.svg", "08.svg", "09.svg", "10.svg", "11.svg", "12.svg", "13.svg", 
        "14.svg", "15.svg", "16.svg", "17.svg", "18.svg", "19.svg", "20.svg",
        "dot-00.svg", "dot-01.svg", "dot-02.svg", "dot-03.svg", "dot-04.svg", 
        "dot-05.svg", "dot-06.svg", "dot-07.svg", "dot-08.svg", "dot-09.svg", 
        "dot-10.svg", "dot-11.svg", "dot-12.svg", "dot-13.svg", "dot-14.svg", 
        "dot-15.svg", "dot-16.svg", "dot-17.svg", "dot-18.svg", "dot-19.svg", 
        "dot-20.svg"
    ];

    const elementos = [];
    const escalaGlobal = 0.5;
    const contentor = document.getElementById('animacao-fundo');

    // Se o contentor não existir na página, o código para aqui e não dá erro
    if (!contentor) return;

    const espessuraParede = 60;
    const chao = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + espessuraParede / 2, window.innerWidth, espessuraParede, { isStatic: true });
    const paredeEsq = Bodies.rectangle(0 - espessuraParede / 2, window.innerHeight / 2, espessuraParede, window.innerHeight, { isStatic: true });
    const paredeDir = Bodies.rectangle(window.innerWidth + espessuraParede / 2, window.innerHeight / 2, espessuraParede, window.innerHeight, { isStatic: true });
    
    Composite.add(world, [chao, paredeEsq, paredeDir]);

    function gerarCorAleatoria() {
        const letras = '0123456789ABCDEF';
        let cor = '#';
        for (let i = 0; i < 6; i++) {
            cor += letras[Math.floor(Math.random() * 16)];
        }
        return cor;
    }

    async function prepararSVG(url, cor) {
        try {
            const resposta = await fetch(url);
            const textoSVG = await resposta.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(textoSVG, "image/svg+xml");
            const svgElement = doc.querySelector("svg");
            
            if (!svgElement) return null;

            let largura = parseFloat(svgElement.getAttribute("width"));
            let altura = parseFloat(svgElement.getAttribute("height"));

            if (isNaN(largura) || isNaN(altura)) {
                const viewBox = svgElement.getAttribute("viewBox");
                if (viewBox) {
                    const partes = viewBox.split(/\s+/);
                    if (partes.length === 4) {
                        largura = parseFloat(partes[2]);
                        altura = parseFloat(partes[3]);
                    }
                }
            }

            if (isNaN(largura) || isNaN(altura) || largura === 0 || altura === 0) {
                largura = 100;
                altura = 100;
            }

            const formas = svgElement.querySelectorAll("path, rect, circle, polygon, ellipse, polyline, line");
            formas.forEach(forma => {
                if (forma.getAttribute("fill") !== "none") {
                    forma.setAttribute("fill", cor);
                } else if (!forma.getAttribute("fill")) {
                    forma.setAttribute("fill", cor); 
                }
                
                if (forma.getAttribute("stroke") && forma.getAttribute("stroke") !== "none") {
                    forma.setAttribute("stroke", cor);
                }
            });

            return { svgElement, largura, altura };
        } catch (erro) {
            console.error("Erro ao preparar o SVG:", erro);
            return null;
        }
    }

    async function criarElemento() {
        const ficheiroAleatorio = meusSVGs[Math.floor(Math.random() * meusSVGs.length)];
        const url = `${githubBaseUrl}/${ficheiroAleatorio}`;
        const cor = gerarCorAleatoria(); 
        
        const resultado = await prepararSVG(url, cor);
        if (!resultado) return; 

        const { svgElement, largura, altura } = resultado;

        const larguraReal = largura * escalaGlobal;
        const alturaReal = altura * escalaGlobal;

        svgElement.classList.add('falling-svg');
        svgElement.style.width = `${larguraReal}px`;
        svgElement.style.height = `${alturaReal}px`;
        
        contentor.appendChild(svgElement);

        const startX = Math.random() * (window.innerWidth - 100) + 50;
        const startY = -alturaReal - 20;

        const corpoFisico = Bodies.rectangle(startX, startY, larguraReal, alturaReal, { 
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

    for (let i = 0; i < 30; i++) {
        setTimeout(criarElemento, i * 180);
    }

    const runner = Runner.create();
    Runner.run(runner, engine);

    function animar() {
        elementos.forEach(el => {
            const posX = el.fisica.position.x - el.metadeLargura;
            const posY = el.fisica.position.y - el.metadeAltura;
            const angulo = el.fisica.angle;

            el.visual.style.transform = `translate(${posX}px, ${posY}px) rotate(${angulo}rad)`;
        });

        requestAnimationFrame(animar);
    }

    animar();

    window.addEventListener('resize', () => {
        Matter.Body.setPosition(chao, { x: window.innerWidth / 2, y: window.innerHeight + espessuraParede / 2 });
        Matter.Body.setVertices(chao, Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight + espessuraParede / 2, window.innerWidth, espessuraParede).vertices);
        
        elementos.forEach(el => { Matter.Sleeping.set(el.fisica, false); });
    });
});