const CONFIG = {
    monoImageFile: "base.png",
    spAuraFile: "aura.png",
    patterns: [
        { name: "ツートン", file: "01.png" },
        { name: "ボーダー", file: "02.png" },
        { name: "ストライプ", file: "03.png" },
        { name: "水玉", file: "04.png" },
        { name: "アニマル", file: "05.png" },
        { name: "斜めボーダー", file: "06.png" },
        { name: "ピンドット", file: "07.png" },
        { name: "ギンガムチェック", file: "08.png" },
        { name: "ダイヤ", file: "09.png" },
        { name: "レンガ", file: "10.png" },
        { name: "スプラッシュ", file: "11.png" },
        { name: "マーブル", file: "12.png" },
        { name: "鱗文", file: "13.png" },
        { name: "蛇", file: "14.png" },
        { name: "シェブロン", file: "15.png" },
        { name: "トラ", file: "16.png" },
        { name: "しずく", file: "17.png" },
        { name: "うろこ", file: "18.png" },
        { name: "バブルドット", file: "19.png" },
        { name: "花", file: "20.png" },
        { name: "スペード", file: "21.png" },
        { name: "星", file: "22.png" },
        { name: "地層", file: "23.png" },
    ],

    colors: [
        {code: "262626", name: "黒"}, {code: "191919", name: "黒濃"}, {code: "3c3c3c", name: "黒薄"},
        {code: "e6130b", name: "赤"}, {code: "b50d0d", name: "赤濃"}, {code: "f43246", name: "赤薄"},
        {code: "23bfe9", name: "水"}, {code: "1180a7", name: "水濃"}, {code: "80e5ee", name: "水薄"},
        {code: "1fc448", name: "緑"}, {code: "307a2a", name: "緑濃"}, {code: "73e46d", name: "緑薄"},
        {code: "fd711f", name: "橙"}, {code: "d15f0b", name: "橙濃"}, {code: "f5a72c", name: "橙薄"},
        {code: "efe70a", name: "黄"}, {code: "e8be14", name: "黄濃"}, {code: "f0ef6e", name: "黄薄"},
        {code: "0f2eec", name: "青"}, {code: "142591", name: "青濃"}, {code: "5382fb", name: "青薄"},
        {code: "d8d0c8", name: "白"}, {code: "beb4aa", name: "白濃"}, {code: "f5f5c8", name: "白薄"},
        {code: "7817f6", name: "紫"}, {code: "320296", name: "紫濃"}, {code: "b45ef8", name: "紫薄"},
        {code: "fa4789", name: "桃"}, {code: "be2655", name: "桃濃"}, {code: "fea0cf", name: "桃薄"},
        {code: "a37900", name: "金"}, {code: "696900", name: "金濃"}, {code: "b4b428", name: "金薄"},
        {code: "6e7f7f", name: "銀"}, {code: "566262", name: "銀濃"}, {code: "96b4c6", name: "銀薄"}
    ]
};

let currentMode = 'mono';
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

function init() {
    const patSel = document.getElementById('patternImageSelect');
    if (patSel) CONFIG.patterns.forEach(item => patSel.add(new Option(item.name, item.file)));
    
    const c1Sel = document.getElementById('color1Select');
    const c2Sel = document.getElementById('color2Select');
    CONFIG.colors.forEach(c => {
        c1Sel.add(new Option(`${c.name}`, c.code));
        c2Sel.add(new Option(`${c.name}`, c.code));
    });

    c1Sel.value = "e6130b"; 
    c2Sel.value = "262626";

    setupEventListeners();
    render();
}

function setupEventListeners() {
    document.getElementById('modeMono').onclick = () => switchMode('mono');
    document.getElementById('modePattern').onclick = () => switchMode('pattern');
    document.getElementById('spEnable').onchange = render;
    
    document.getElementById('swapBtn').onclick = () => {
        const c1 = document.getElementById('color1Select');
        const c2 = document.getElementById('color2Select');
        const temp = c1.value;
        c1.value = c2.value;
        c2.value = temp;
        render();
    };

    ['patternImageSelect', 'color1Select', 'color2Select'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.onchange = render;
    });

    document.getElementById('downloadBtn').onclick = () => {
        const link = document.createElement('a');
        link.download = `export_${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };
}

function switchMode(mode) {
    currentMode = mode;
    document.getElementById('modeMono').classList.toggle('active', mode === 'mono');
    document.getElementById('modePattern').classList.toggle('active', mode === 'pattern');
    document.getElementById('monoOnlySettings').classList.toggle('hidden', mode !== 'mono');
    document.getElementById('patternOnlySettings').classList.toggle('hidden', mode !== 'pattern');
    document.getElementById('color2Group').classList.toggle('hidden', mode !== 'pattern');
    document.getElementById('c1Label').innerText = (mode === 'mono') ? "着色カラー" : "色1 (白部分)";
    render();
}

async function render() {

    const color1 = hexToRgb(document.getElementById('color1Select').value);
    const color2 = (currentMode === 'mono') ? {r:0, g:0, b:0} : hexToRgb(document.getElementById('color2Select').value);
    
    const path = (currentMode === 'mono') 
        ? `pic/monochromatic/${CONFIG.monoImageFile}`
        : `pic/pattern/${document.getElementById('patternImageSelect').value}`;

    try {
        const img = await loadImage(path);
        canvas.width = img.width;
        canvas.height = img.height;
        
        canvas.style.width = ""; 
        canvas.style.height = "";
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] === 0) continue; 

            const brightness = (data[i] + data[i+1] + data[i+2]) / 3 / 255;

            data[i]     = color2.r + (color1.r - color2.r) * brightness;
            data[i + 1] = color2.g + (color1.g - color2.g) * brightness;
            data[i + 2] = color2.b + (color1.b - color2.b) * brightness;
        }
        ctx.putImageData(imageData, 0, 0);

        if (currentMode === 'mono' && document.getElementById('spEnable').checked) {
            const auraImg = await loadImage(`pic/Aura/${CONFIG.spAuraFile}`);
            ctx.drawImage(auraImg, 0, 0, canvas.width, canvas.height);
        }
    } catch (e) {
        console.error("Render error:", e);
    }
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load: " + src));
        img.src = src;
    });
}

function hexToRgb(hex) {
    const b = parseInt(hex, 16);
    return { r: (b >> 16) & 255, g: (b >> 8) & 255, b: b & 255 };
}

init();
