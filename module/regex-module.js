// regex-module.js - 獨立的 Regex 工具模組

window.RegexModule = {
    // 返回工具的 HTML 結構
    getHTML: () => `
        <div class="regex-tool-wrapper">
            <style>
            /* --- 結構與佈局樣式 (無顏色) --- */
            .regex-container { display: flex; flex-wrap: wrap; gap: 20px; width: 100%; max-width: 100%; }
            .regex-panel { padding: 20px; display: flex; flex-direction: column; min-width: 0; border-radius: 8px; border-width: 1px; border-style: solid; }
            .regex-inputs-panel { flex: 1 1 300px; }
            .regex-previews-panel { flex: 2 1 400px; }
            .regex-form-group { margin-bottom: 15px; }
            .regex-label { display: block; margin-bottom: 5px; font-weight: bold; }
            .regex-input, .regex-textarea { width: 100%; padding: 10px; font-size: 16px; font-family: 'Courier New', Courier, monospace; box-sizing: border-box; resize: vertical; border-radius: 4px; border-width: 1px; border-style: solid; }
            .regex-textarea { min-height: 120px; }
            .regex-group { display: flex; align-items: center; gap: 10px; }
            .regex-group .regex-pattern { flex-grow: 1; }
            .regex-group .regex-flags { width: 50px; }
            .regex-preview-box { padding: 15px; overflow: auto; min-height: 200px; white-space: pre-wrap; word-wrap: break-word; border-radius: 4px; border-width: 1px; border-style: solid; }
            .regex-highlight { border-radius: 3px; padding: 1px 3px; background-color: var(--highlight-bg); color: var(--highlight-text); }
            .regex-error { font-weight: bold; min-height: 20px; color: #e74c3c; /* 錯誤顏色通常是固定的 */ }
            .regex-source-list-header { display: flex; justify-content: space-between; align-items: center; }
            .regex-add-btn { border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 18px; cursor: pointer; }
            .regex-source-container { min-height: 150px; overflow-y: auto; border-radius: 4px; border-width: 1px; border-style: solid; }
            .regex-source-wrapper { display: flex; align-items: center; gap: 8px; padding: 0 8px; border-bottom-width: 1px; border-bottom-style: solid; }
            .regex-source-wrapper:last-child { border-bottom: none; }
            .regex-source-item { flex-grow: 1; padding: 8px 0; cursor: text; font-family: 'Courier New', Courier, monospace; white-space: pre-wrap; }
            .regex-source-item:focus { outline: none; background-color: var(--input-focus-bg); }
            .regex-delete-btn { width: 22px; height: 22px; border-radius: 50%; border: none; font-size: 16px; cursor: pointer; transition: all 0.2s; }
            .regex-delete-btn:hover { background-color: #e74c3c; color: white; }
            .regex-h3 { margin-top: 0; padding-bottom: 10px; border-bottom-width: 2px; border-bottom-style: solid; }
            .regex-label-wrapper { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
            .regex-warning { display: none; font-size: 12px; font-weight: normal; color: #e67e22; /* 警告顏色通常是固定的 */ }
            .regex-source-wrapper.unaffected { border-left-width: 3px; border-left-style: solid; }
            .help-btn { font-size: 14px; background: none; border: none; cursor: pointer; padding: 0 5px; }
            .help-btn:hover { text-decoration: underline; }

            /* --- Modal 結構樣式 --- */
            .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.6); justify-content: center; align-items: center; }
            .modal-content { margin: auto; padding: 25px 35px; border-radius: 10px; width: 90%; max-width: 700px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); line-height: 1.7; max-height: 85vh; overflow-y: auto; border-width: 1px; border-style: solid; }
            .modal-close-btn { float: right; font-size: 28px; font-weight: bold; cursor: pointer; transition: color 0.2s; }
            .modal-content h3 { margin-top: 0; padding-bottom: 10px; border-bottom-width: 2px; border-bottom-style: solid; }
            .modal-content h2 { margin-top: 25px; margin-bottom: 10px; font-size: 1.2em; }
            .modal-content p, .modal-content li { font-size: 15px; }
            .modal-content ul { padding-left: 20px; list-style-type: disc; }
            .modal-content li { margin-bottom: 12px; }
            .modal-content code { padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', Courier, monospace; font-size: 0.95em; }
            .modal-content hr { border: 0; border-top-width: 1px; border-top-style: solid; margin: 20px 0; }
            .modal-content center p { border-radius: 5px; padding: 8px; margin-top: 5px; display: inline-block; border-width: 1px; border-style: solid; }

            @media (max-width: 800px) { .regex-container { flex-direction: column; } }
        </style>
            
            <!-- 新增: 幫助視窗 Modal -->
            <div id="help-modal" class="modal">
                <div class="modal-content">
                    <span id="close-btn" class="modal-close-btn">&times;</span>
                    <h3>工具說明</h3>
                    <p>本工具可以根據您設定的正規表示式 (Regex)，批量替換多則範本文字的內容，並即時預覽結果。</p>
                    <h2>功能總覽</h2>
                    <ul>
                        <li><strong>正規表示式 (Regex)</strong><br>輸入您想尋找的文字模式。例如，<code>\bworld\b</code> 可以精準地找到單詞 "world"。右邊的小框是旗標 (Flags)，<code>g</code> 代表全域尋找，<code>i</code> 代表忽略大小寫。</li>
                        <li>
                            <strong>替換內容</strong><br>
                            輸入您希望將符合的文字替換成的內容。這裡支援 HTML 語法，也支援使用特殊變數來重新組合被 Regex 抓到的文字：
                            <ul>
                                <li><code>{{match}}</code> 或 <code>$&amp;</code>：代表整個被 Regex 符合的完整文字。</li>
                                <li><code>$1</code>, <code>$2</code>, <code>$3</code>...：代表 Regex 中第 1、2、3... 個括號 <code>()</code> 所捕獲的內容。</li>
                            </ul>
                            例如：若 Regex 是 <code>(Hello) (World)</code>，替換內容寫成 <code>$2, $1!</code>，結果就會變成 "World, Hello!"。
                        </li>
                        <li><strong>最小深度</strong><br>這是本工具的核心功能。設定一個數字 N，則範本列表中<strong>最新的 N 則內容將不會被 Regex 影響</strong>，保持原樣。所有比這 N 則更舊的內容，都會被 Regex 規則處理。<br><center><strong><p>不被Regex影響的回覆，其背景顏色將會是淡藍色</p></strong></center></li>
                        <li><strong>範本列表</strong><br>- <strong>編輯：</strong>直接用滑鼠點擊任何一則範本即可開始編輯文字。<br>- <strong>新增：</strong>點擊右上角的 <code>+</code> 按鈕來新增一則範本。<br>- <strong>藍色標示：</strong>被藍色標示的範本，就是根據上方設定將被「保留」的最新內容。</li>
                    </ul>
                    <h2>預覽區</h2>
                    <ul>
                        <li><strong>符合項目預覽：</strong>以純文字顯示所有範本，並將被 Regex 符合的部分用黃色背景高亮出來。</li>
                        <li><strong>替換結果預覽：</strong>顯示最終的處理結果。被替換的範本會顯示新內容（並渲染HTML），被保留的範本則顯示原文。</li>
                    </ul>
                    <hr>
                    <p><small>工具狀態會自動儲存在你的瀏覽器中。</small></p>
                </div>
            </div>

            <div class="regex-container">
                <!-- 左側:輸入區 -->
                <div class="regex-panel regex-inputs-panel">
                    <h3 class="regex-h3">輸入</h3>
                    <div class="regex-form-group">
                        <label class="regex-label" for="regex-input">正則表達式 (Regex)</label>
                        <div class="regex-group">
                            <input type="text" id="regex-input" class="regex-input regex-pattern">
                            <input type="text" id="flags-input" title="Regex Flags (e.g., g, i, m)" class="regex-input regex-flags">
                        </div>
                        <div id="error-message" class="regex-error"></div>
                    </div>
                    <div class="regex-form-group">
                        <div class="regex-label-wrapper">
                            <label class="regex-label" for="replacement-input">替換內容 (支持部分HTML)</label>
                            <span id="st-warning-message" class="regex-warning"></span>
                        </div>
                        <textarea id="replacement-input" class="regex-textarea"></textarea>
                    </div>
                    <div class="regex-form-group">
                        <label class="regex-label" for="depth-input">最小深度 (不被 Regex 影響)</label>
                        <input type="number" id="depth-input" min="0" class="regex-input">
                    </div>
                    <div class="regex-form-group">
                        <div class="regex-source-list-header">
                            <label class="regex-label">範本列表 (點擊即可編輯)</label>
                            <button id="add-source-btn" class="regex-add-btn" title="新增範本">+</button>
                        </div>
                        <div id="source-list-container" class="regex-source-container"></div>
                    </div>
                </div>

                <!-- 右側:預覽區 -->
                <div class="regex-panel regex-previews-panel">
                     <div class="regex-label-wrapper">
                        <h3 class="regex-h3">預覽</h3>
                        <button id="help-btn" class="help-btn">需要幫助？</button>
                    </div>
                    <div class="regex-form-group">
                        <label class="regex-label">符合項目預覽</label>
                        <div id="match-preview" class="regex-preview-box"></div>
                    </div>
                    <div class="regex-form-group">
                        <label class="regex-label">替換結果預覽 (HTML渲染)</label>
                        <div id="replacement-preview" class="regex-preview-box"></div>
                    </div>
                </div>
            </div>
        </div>
    `,

    // 初始化工具
    init: () => {
        // --- 暫存和預設值設定 ---
        const STORAGE_KEY = 'regexToolState';
        const DEFAULTS = {
            regex: '\\b(world|範本)\\b',
            flags: 'gi',
            replacement: '<span style="color: blue; font-weight: bold;">$&</span>',
            depth: 1,
            sources: [
                "這是第一個範本, Hello world.",
                "這是第二個範本, welcome to the new world.",
                "這是第三個範本，不受影響。"
            ]
        };

        // --- 狀態管理 ---
        let sourceTexts = [];

        // --- 獲取 DOM 元素 ---
        const regexInput = document.getElementById('regex-input');
        const flagsInput = document.getElementById('flags-input');
        const replacementInput = document.getElementById('replacement-input');
        const depthInput = document.getElementById('depth-input');
        const sourceListContainer = document.getElementById('source-list-container');
        const addSourceBtn = document.getElementById('add-source-btn');
        const matchPreview = document.getElementById('match-preview');
        const replacementPreview = document.getElementById('replacement-preview');
        const errorMessage = document.getElementById('error-message');
        const helpBtn = document.getElementById('help-btn');
        const helpModal = document.getElementById('help-modal');
        const closeBtn = document.getElementById('close-btn');
        const stWarningMessage = document.getElementById('st-warning-message');

        // --- 儲存/讀取狀態 ---
        function saveState() {
            const currentState = {
                regex: regexInput.value,
                flags: flagsInput.value,
                replacement: replacementInput.value,
                depth: parseInt(depthInput.value, 10),
                sources: sourceTexts
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
        }

        function loadState() {
            const savedStateJSON = localStorage.getItem(STORAGE_KEY);
            let state = DEFAULTS;
            if (savedStateJSON) {
                try {
                    state = { ...DEFAULTS, ...JSON.parse(savedStateJSON) };
                } catch (e) {
                    console.error("Failed to parse saved state, using defaults.", e);
                    state = DEFAULTS;
                }
            }
            regexInput.value = state.regex;
            flagsInput.value = state.flags;
            replacementInput.value = state.replacement;
            depthInput.value = state.depth;
            sourceTexts = [...state.sources];
        }

        // --- 說明視窗 Modal 的邏輯 ---
        helpBtn.addEventListener('click', () => { helpModal.style.display = 'flex'; });
        closeBtn.addEventListener('click', () => { helpModal.style.display = 'none'; });
        window.addEventListener('click', (event) => { if (event.target == helpModal) { helpModal.style.display = 'none'; } });

        // --- 核心函數 ---
        function updatePreviews() {
            const regexPattern = regexInput.value;
            const regexFlags = flagsInput.value;
            const replacementString = replacementInput.value;
            const depth = parseInt(depthInput.value, 10) || 0;
            let regex;
            
            try {
                regex = new RegExp(regexPattern, regexFlags);
                errorMessage.textContent = '';
            } catch (e) {
                errorMessage.textContent = '無效的正規表示式: ' + e.message;
                return;
            }

            const totalSources = sourceTexts.length;
            const processEndIndex = totalSources - depth;
            const matchPreviewParts = [];
            const replacementPreviewParts = [];

            sourceTexts.forEach((source, index) => {
                const shouldProcess = index < processEndIndex && regexPattern !== '';
                
                if (shouldProcess) {
                    const escapedSource = escapeHTML(source);
                    const highlighted = escapedSource.replace(regex, match => `<span class="regex-highlight">${escapeHTML(match)}</span>`);
                    matchPreviewParts.push(highlighted);

                    const replaced = source.replace(regex, replacementString);
                    replacementPreviewParts.push(replaced);
                } else {
                    matchPreviewParts.push(escapeHTML(source));
                    replacementPreviewParts.push(escapeHTML(source));
                }
            });

            matchPreview.innerHTML = matchPreviewParts.join('<hr style="border:0; border-top: 1px dashed #ccc; margin: 5px 0;">');
            const finalReplacementHTML = replacementPreviewParts.join('<hr style="border:0; border-top: 1px solid #eee; margin: 5px 0;">');
            replacementPreview.innerHTML = sanitizeHtml(finalReplacementHTML);
        }

        // --- 輔助函數 ---
        function escapeHTML(text) {
            const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
            return String(text).replace(/[&<>"']/g, m => map[m]);
        }

        function sanitizeHtml(htmlString) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, 'text/html');
            const forbiddenTags = ['script', 'iframe', 'object', 'embed', 'form', 'style', 'link', 'meta'];
            
            doc.querySelectorAll(forbiddenTags.join(',')).forEach(el => el.remove());
            doc.querySelectorAll('*').forEach(el => {
                for (const attr of [...el.attributes]) {
                    if (attr.name.toLowerCase().startsWith('on')) {
                        el.removeAttribute(attr.name);
                    }
                }
            });
            // DOMParser 會自動加上 <html><head></head><body>...</body></html>
            // 我們只需要 body 內的內容
            return doc.body.innerHTML;
        }

        function renderSourceList() {
            sourceListContainer.innerHTML = ''; // 清空
            const depth = parseInt(depthInput.value, 10) || 0;
            const totalSources = sourceTexts.length;
            const unaffectedStartIndex = Math.max(0, totalSources - depth);

            sourceTexts.forEach((text, index) => {
                const wrapperDiv = document.createElement('div');
                wrapperDiv.className = 'regex-source-wrapper';
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'regex-source-item';
                itemDiv.contentEditable = true;
                itemDiv.textContent = text;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'regex-delete-btn';
                deleteBtn.textContent = '×';
                deleteBtn.title = '刪除此範本';

                if (index >= unaffectedStartIndex) {
                    wrapperDiv.classList.add('unaffected');
                }

                itemDiv.addEventListener('blur', () => {
                    sourceTexts[index] = itemDiv.textContent;
                    handleInputChange();
                });

                deleteBtn.addEventListener('click', () => {
                    sourceTexts.splice(index, 1);
                    handleDepthChange(); // 重新渲染並更新
                });

                wrapperDiv.appendChild(itemDiv);
                wrapperDiv.appendChild(deleteBtn);
                sourceListContainer.appendChild(wrapperDiv);
            });
        }

        function checkForbiddenTags() {
            const replacementText = replacementInput.value;
            const forbiddenTagRegex = /<\/?(html|body|head|script)\b/gi;
            const matches = [...replacementText.matchAll(forbiddenTagRegex)];
            const foundTags = new Set(matches.map(match => match[1].toLowerCase()));

            if (foundTags.size > 0) {
                const formattedTags = [...foundTags].map(tag => `&lt;${tag}&gt;`).join(', ');
                stWarningMessage.innerHTML = `SillyTavern可能不支援：${formattedTags}`;
                stWarningMessage.style.display = 'inline';
            } else {
                stWarningMessage.style.display = 'none';
            }
        }

        // --- 事件處理 ---
        function handleInputChange() {
            checkForbiddenTags();
            updatePreviews();
            saveState();
        }

        function handleDepthChange() {
            renderSourceList();
            updatePreviews();
            saveState();
        }

        // --- 事件監聽 ---
        [regexInput, flagsInput, replacementInput].forEach(element => element.addEventListener('input', handleInputChange));
        depthInput.addEventListener('input', handleDepthChange);

        addSourceBtn.addEventListener('click', () => {
            sourceTexts.push("點此編輯新範本...");
            handleDepthChange(); // 重新渲染並更新
            // 自動聚焦到新項目
            const lastItem = sourceListContainer.querySelector('.regex-source-wrapper:last-child .regex-source-item');
            if(lastItem) {
                lastItem.focus();
            }
        });

        // --- 初始化 ---
        loadState();
        renderSourceList();
        updatePreviews();
        checkForbiddenTags();
    }
};

// 導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegexModule;
}