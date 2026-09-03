// ===== 通用触摸事件工具函数 =====
function bindTouchEvents(element, handlers) {
    // 触摸开始
    element.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        const event = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: function() { e.preventDefault(); },
            stopPropagation: function() { e.stopPropagation(); }
        };
        if (handlers.mousedown) handlers.mousedown(event);
    }, { passive: true });

    // 触摸结束
    element.addEventListener('touchend', function(e) {
        const event = {
            preventDefault: function() { e.preventDefault(); },
            stopPropagation: function() { e.stopPropagation(); }
        };
        if (handlers.mouseup) handlers.mouseup(event);
    }, { passive: true });

    // 触摸移动
    element.addEventListener('touchmove', function(e) {
        const touch = e.touches[0];
        const event = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: function() { e.preventDefault(); },
            stopPropagation: function() { e.stopPropagation(); }
        };
        if (handlers.mousemove) handlers.mousemove(event);
    }, { passive: true });

    // 触摸取消
    element.addEventListener('touchcancel', function(e) {
        if (handlers.mouseleave) handlers.mouseleave();
    });
}

// ===== 设置面板 =====
function openSettings() {
    document.getElementById('desktop').classList.add('hidden');
    document.getElementById('settings-panel').classList.add('show');
}

function closeSettings() {
    document.getElementById('desktop').classList.remove('hidden');
    document.getElementById('settings-panel').classList.remove('show');
}

// ===== 通讯录与角色管理（包含本地永久保存） =====
const contactsData = [{ name: "Chat", avatar: "", desc: "" }];

function loadContacts() {
    try {
        const saved = localStorage.getItem('contactsData');
        if (saved) {
            contactsData.length = 0;
            const parsed = JSON.parse(saved);
            parsed.forEach(item => contactsData.push(item));
        }
    } catch(e) {}
}

function saveContacts() {
    try { localStorage.setItem('contactsData', JSON.stringify(contactsData)); } catch(e) {}
}

loadContacts();

let currentEditingIndex = -1;
let pressTimer = null;

function openContacts() {
    document.getElementById('desktop').classList.add('hidden');
    document.getElementById('contacts-panel').classList.add('show');
    renderContacts();
}

function closeContacts() {
    document.getElementById('desktop').classList.remove('hidden');
    document.getElementById('contacts-panel').classList.remove('show');
}

function renderContacts() {
    const list = document.getElementById('contacts-list');
    list.innerHTML = '';
    
    contactsData.forEach((contact, index) => {
        const row = document.createElement('div');
        row.className = 'contact-row';
        row.onclick = () => openPersona(index);
        row.addEventListener('mousedown', startPress);
        row.addEventListener('touchstart', startPress, { passive: true });
        row.addEventListener('mouseup', cancelPress);
        row.addEventListener('touchend', cancelPress, { passive: true });
        row.addEventListener('mouseleave', cancelPress);
        row.addEventListener('touchcancel', cancelPress);

        function startPress(e) {
            pressTimer = setTimeout(() => {
                const confirmDelete = confirm(`确定要删除角色“${contact.name}”吗？删除后其对应的人设资料也会一并删除！`);
                if (confirmDelete) {
                    contactsData.splice(index, 1);
                    saveContacts();
                    renderContacts();
                }
            }, 700);
        }

        function cancelPress(e) {
            clearTimeout(pressTimer);
        }

        const avatar = document.createElement('div');
        avatar.className = 'contact-avatar';
        if (contact.avatar) avatar.style.backgroundImage = `url('${contact.avatar}')`;
        else avatar.textContent = "👤";
        avatar.onclick = (e) => { e.stopPropagation(); currentEditingIndex = index; document.getElementById('fileInput').click(); };
        
        const input = document.createElement('input');
        input.className = 'contact-name-input';
        input.value = contact.name;
        input.oninput = (e) => { contactsData[index].name = e.target.value; saveContacts(); };
        
        row.appendChild(avatar);
        row.appendChild(input);
        list.appendChild(row);
    });
}

function addContact() {
    contactsData.push({ name: "新角色", avatar: "", desc: "" });
    saveContacts();
    renderContacts();
}

function openPersona(index) {
    currentEditingIndex = index;
    document.getElementById('persona-name').value = contactsData[index].name;
    document.getElementById('persona-desc').value = contactsData[index].desc;
    document.getElementById('persona-avatar').style.backgroundImage = contactsData[index].avatar ? `url('${contactsData[index].avatar}')` : '';
    document.getElementById('contacts-panel').classList.remove('show');
    document.getElementById('persona-panel').classList.add('show');
}

function closePersona() {
    document.getElementById('persona-panel').classList.remove('show');
    document.getElementById('contacts-panel').classList.add('show');
}

function savePersona() {
    contactsData[currentEditingIndex].name = document.getElementById('persona-name').value;
    contactsData[currentEditingIndex].desc = document.getElementById('persona-desc').value;
    saveContacts();
    showToast('人设保存成功');
    renderContacts();
    closePersona();
}

// ===== User资料管理（便签纸墙） =====
const userProfilesData = [{ name: "我的身份", avatar: "", age: "", desc: "" }];

function loadUserProfiles() {
    try {
        const saved = localStorage.getItem('userProfilesData');
        if (saved) {
            userProfilesData.length = 0;
            const parsed = JSON.parse(saved);
            parsed.forEach(item => userProfilesData.push(item));
        }
    } catch(e) {}
}

function saveUserProfiles() {
    try { localStorage.setItem('userProfilesData', JSON.stringify(userProfilesData)); } catch(e) {}
}

loadUserProfiles();

let currentUserProfileIndex = -1;

function openUserProfiles() {
    document.getElementById('chat-panel').classList.remove('show');
    document.getElementById('user-profiles-wall').classList.add('show');
    renderUserProfiles();
}

function closeUserProfiles() {
    document.getElementById('user-profiles-wall').classList.remove('show');
    document.getElementById('chat-panel').classList.add('show');
}

function renderUserProfiles() {
    const list = document.getElementById('user-profiles-list');
    list.innerHTML = '';
    
    userProfilesData.forEach((profile, index) => {
        const note = document.createElement('div');
        note.className = 'user-note-card';
        note.onclick = () => openUserProfileEdit(index);
        note.addEventListener('mousedown', startPress);
        note.addEventListener('touchstart', startPress, { passive: true });
        note.addEventListener('mouseup', cancelPress);
        note.addEventListener('touchend', cancelPress, { passive: true });
        note.addEventListener('mouseleave', cancelPress);
        note.addEventListener('touchcancel', cancelPress);

        function startPress(e) {
            pressTimer = setTimeout(() => {
                const confirmDelete = confirm(`确定要删除身份“${profile.name}”吗？`);
                if (confirmDelete) {
                    userProfilesData.splice(index, 1);
                    saveUserProfiles();
                    renderUserProfiles();
                }
            }, 700);
        }

        function cancelPress(e) {
            clearTimeout(pressTimer);
        }

        const tape = document.createElement('div');
        tape.className = 'user-note-tape';

        const avatar = document.createElement('div');
        avatar.className = 'user-note-avatar';
        if (profile.avatar) avatar.style.backgroundImage = `url('${profile.avatar}')`;
        else avatar.textContent = "😊";

        const name = document.createElement('div');
        name.className = 'user-note-name';
        name.textContent = profile.name;

        note.appendChild(tape);
        note.appendChild(avatar);
        note.appendChild(name);
        list.appendChild(note);
    });
}

function addUserProfile() {
    userProfilesData.push({ name: "新身份", avatar: "", age: "", desc: "" });
    saveUserProfiles();
    renderUserProfiles();
}

function openUserProfileEdit(index) {
    currentUserProfileIndex = index;
    document.getElementById('user-profile-name').value = userProfilesData[index].name;
    document.getElementById('user-profile-age').value = userProfilesData[index].age || '';
    document.getElementById('user-profile-desc').value = userProfilesData[index].desc;
    document.getElementById('user-profile-avatar').style.backgroundImage = userProfilesData[index].avatar ? `url('${userProfilesData[index].avatar}')` : '';
    document.getElementById('user-profiles-wall').classList.remove('show');
    document.getElementById('user-profile-edit').classList.add('show');
}

function closeUserProfileEdit() {
    document.getElementById('user-profile-edit').classList.remove('show');
    document.getElementById('user-profiles-wall').classList.add('show');
}

function saveUserProfile() {
    userProfilesData[currentUserProfileIndex].name = document.getElementById('user-profile-name').value;
    userProfilesData[currentUserProfileIndex].age = document.getElementById('user-profile-age').value;
    userProfilesData[currentUserProfileIndex].desc = document.getElementById('user-profile-desc').value;
    saveUserProfiles();
    showToast('身份资料已保存');
    renderUserProfiles();
    closeUserProfileEdit();
}

// ===== Chat 管理（包含本地永久保存） =====
let chatSessions = [];

function loadChatSessions() {
    try {
        const saved = localStorage.getItem('chatSessionsData');
        if (saved) chatSessions = JSON.parse(saved);
    } catch(e) { chatSessions = []; }
}

function saveChatSessions() {
    try { localStorage.setItem('chatSessionsData', JSON.stringify(chatSessions)); } catch(e) {}
}

loadChatSessions();

function ensureChatSessionSettings() {
    chatSessions.forEach(session => {
        if (!session.settings) {
            session.settings = { memoryLimit: 50, temperature: 0.7, timestampEnabled: false, worldbookIds: [], userProfileIndex: 0 };
        }
    });
    saveChatSessions();
}
ensureChatSessionSettings();

function openChat() {
    showDestinyIntro();
    document.getElementById('desktop').classList.add('hidden');
    document.getElementById('chat-panel').classList.add('show');
    renderChatSessions();
}

function closeChat() {
    document.getElementById('desktop').classList.remove('hidden');
    document.getElementById('chat-panel').classList.remove('show');
}

function renderChatSessions() {
    const list = document.getElementById('chat-list');
    const emptyState = document.getElementById('chat-empty-state');
    list.innerHTML = '';

    if (chatSessions.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';

    chatSessions.forEach((session, index) => {
        const contact = contactsData.find(c => c.name === session.contactName) || session;
        const row = document.createElement('div');
        row.className = 'chat-session-row';
        row.onclick = () => openChatDetail(index);
        row.addEventListener('mousedown', startPress);
        row.addEventListener('touchstart', startPress, { passive: true });
        row.addEventListener('mouseup', cancelPress);
        row.addEventListener('touchend', cancelPress, { passive: true });
        row.addEventListener('mouseleave', cancelPress);
        row.addEventListener('touchcancel', cancelPress);
        
        function startPress(e) {
            pressTimer = setTimeout(() => {
                const confirmRemove = confirm(`确定要移除与“${contact.name}”的会话吗？`);
                if (confirmRemove) {
                    chatSessions.splice(index, 1);
                    saveChatSessions();
                    renderChatSessions();
                }
            }, 700);
        }
        
        function cancelPress(e) {
            clearTimeout(pressTimer);
        }
        
        const avatar = document.createElement('div');
        avatar.className = 'chat-session-avatar';
        if (contact.avatar) avatar.style.backgroundImage = `url('${contact.avatar}')`;
        else avatar.textContent = "👤";
        
        const name = document.createElement('div');
        name.className = 'chat-session-name';
        name.textContent = contact.name;
        
        row.appendChild(avatar);
        row.appendChild(name);
        list.appendChild(row);
    });
}

function showAddRoleModal() {
    if (contactsData.length === 0) { showToast('请先添加角色', false); return; }

    const modal = document.getElementById('add-role-modal');
    const list = document.getElementById('add-role-list');
    list.innerHTML = '';

    contactsData.forEach((contact) => {
        if (chatSessions.some(s => s.contactName === contact.name)) return;

        const row = document.createElement('div');
        row.className = 'role-select-row';
        row.onclick = () => {
            chatSessions.push({ contactName: contact.name, messages: [], settings: { memoryLimit: 50, temperature: 0.7, timestampEnabled: false, worldbookIds: [], userProfileIndex: 0 } });
            saveChatSessions();
            hideAddRoleModal();
            renderChatSessions();
        };

        const avatar = document.createElement('div');
        avatar.className = 'role-select-avatar';
        if (contact.avatar) avatar.style.backgroundImage = `url('${contact.avatar}')`;
        else avatar.textContent = "👤";

        const name = document.createElement('div');
        name.className = 'role-select-name';
        name.textContent = contact.name;

        row.appendChild(avatar);
        row.appendChild(name);
        list.appendChild(row);
    });

    modal.classList.add('show');
}

function hideAddRoleModal() {
    document.getElementById('add-role-modal').classList.remove('show');
}

// ===== 聊天详情界面 =====
let currentChatSessionIndex = -1;

function openChatDetail(index) {
    currentChatSessionIndex = index;
    const session = chatSessions[index];
    const contact = contactsData.find(c => c.name === session.contactName) || session;
    
    const aiAvatar = document.getElementById('detail-avatar-ai');
    aiAvatar.style.backgroundImage = contact.avatar ? `url('${contact.avatar}')` : '';
    aiAvatar.innerHTML = contact.avatar ? '' : '👤';
    
    const boundIndex = session.settings.userProfileIndex || 0;
    const boundUser = userProfilesData[boundIndex] || userProfilesData[0];
    const userAvatar = document.getElementById('detail-avatar-user');
    if (boundUser && boundUser.avatar) {
        userAvatar.style.backgroundImage = `url('${boundUser.avatar}')`;
        userAvatar.innerHTML = '';
    } else { userAvatar.innerHTML = '😊'; }
    
    document.getElementById('chat-panel').classList.remove('show');
    document.getElementById('chat-detail-panel').classList.add('show');
    renderChatDetailMessages();
}

function renderChatDetailMessages() {
    const msgContainer = document.getElementById('chat-detail-messages');
    msgContainer.innerHTML = '';
    if (isSelectMode) {
    } else {
        selectedMsgs = [];
    }
    const session = chatSessions[currentChatSessionIndex];
    if (session.messages && session.messages.length > 0) {
        session.messages.forEach((msg, index) => {
            renderMessageBubble(msg.role, msg.content, msg.timestamp, index);
        });
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }
}

function closeChatDetail() {
    document.getElementById('chat-detail-panel').classList.remove('show');
    document.getElementById('chat-panel').classList.add('show');
    document.getElementById('chat-detail-menu-panel').classList.remove('show');
}

function toggleChatMenu() {
    const menu = document.getElementById('chat-detail-menu-panel');
    menu.classList.toggle('show');
}

// ===== 渲染消息气泡（支持长按多选） =====
let isSelectMode = false;
let selectedMsgs = [];

function renderMessageBubble(role, content, timestamp, msgIndex) {
    const messages = document.getElementById('chat-detail-messages');
    const session = chatSessions[currentChatSessionIndex];
    const contact = contactsData.find(c => c.name === session.contactName) || session;

    const line = document.createElement('div');
    line.className = `chat-msg-line ${role}`;
    line.dataset.index = msgIndex;

    const selectCircle = document.createElement('div');
    selectCircle.className = `select-circle ${role === 'user' ? 'right-side' : 'left-side'}`;
    selectCircle.textContent = '';

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg-avatar';
    if (role === 'ai') {
        if (contact.avatar) avatar.style.backgroundImage = `url('${contact.avatar}')`;
        else avatar.textContent = '👤';
    } else {
        const boundIndex = session.settings.userProfileIndex || 0;
        const boundUser = userProfilesData[boundIndex] || userProfilesData[0];
        if (boundUser && boundUser.avatar) avatar.style.backgroundImage = `url('${boundUser.avatar}')`;
        else avatar.textContent = '😊';
    }

    const bubble = document.createElement('div');
    bubble.className = `chat-msg-bubble ${role === 'user' ? 'user-bubble' : 'ai-bubble'}`;
    bubble.textContent = content;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'chat-msg-timestamp';
    timeDiv.textContent = timestamp;

    if (isSelectMode) {
        line.style.cursor = 'pointer';
        selectCircle.style.display = 'flex';
        line.onclick = () => {
            if (selectedMsgs.includes(msgIndex)) {
                selectedMsgs = selectedMsgs.filter(i => i !== msgIndex);
                selectCircle.textContent = '';
                selectCircle.classList.remove('checked');
                line.classList.remove('selected-msg');
            } else {
                selectedMsgs.push(msgIndex);
                selectCircle.textContent = '✓';
                selectCircle.classList.add('checked');
                line.classList.add('selected-msg');
            }
            showDeleteBar();
        };
    }

    let longPressTimer = null;
    
    function startLongPress(e) {
        longPressTimer = setTimeout(() => {
            isSelectMode = true;
            selectedMsgs = [msgIndex];
            selectCircle.textContent = '✓';
            selectCircle.classList.add('checked');
            line.classList.add('selected-msg');
            showDeleteBar();
            renderChatDetailMessages();
        }, 600);
    }
    
    function cancelLongPress(e) {
        clearTimeout(longPressTimer);
    }
    
    line.addEventListener('mousedown', startLongPress);
    line.addEventListener('touchstart', startLongPress, { passive: true });
    line.addEventListener('mouseup', cancelLongPress);
    line.addEventListener('touchend', cancelLongPress, { passive: true });
    line.addEventListener('mouseleave', cancelLongPress);
    line.addEventListener('touchcancel', cancelLongPress);

    if (role === 'ai') {
        if (isSelectMode) line.appendChild(selectCircle);
        line.appendChild(avatar);
        line.appendChild(bubble);
        if (session.settings.timestampEnabled && timestamp) line.appendChild(timeDiv);
    } else {
        if (session.settings.timestampEnabled && timestamp) line.appendChild(timeDiv);
        line.appendChild(bubble);
        line.appendChild(avatar);
        if (isSelectMode) line.appendChild(selectCircle);
    }

    messages.appendChild(line);
    messages.scrollTop = messages.scrollHeight;
}

// ===== 显示删除/取消栏（固定居中） =====
function showDeleteBar() {
    const session = chatSessions[currentChatSessionIndex];
    const oldBar = document.getElementById('delete-bar');
    if (oldBar) oldBar.remove();

    let bar = document.createElement('div');
    bar.id = 'delete-bar';
    bar.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:300px; display:flex; flex-direction:column; gap:10px; background:rgba(30,30,30,0.98); border:1px solid rgba(255,255,255,0.3); border-radius:16px; padding:20px; z-index:999999; box-shadow:0 10px 30px rgba(0,0,0,0.8);';
    
    const title = document.createElement('div');
    title.textContent = `已选中 ${selectedMsgs.length} 条消息`;
    title.style.cssText = 'color:#fff; font-size:16px; text-align:center; margin-bottom:10px;';
    bar.appendChild(title);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '删除选中';
    deleteBtn.style.cssText = 'width:100%; padding:12px; background:#ff4d4d; border:none; border-radius:8px; color:#fff; cursor:pointer; font-size:15px;';
    deleteBtn.onclick = () => {
        if (selectedMsgs.length === 0) { showToast('没有选中任何消息', false); return; }
        const sortedIndices = selectedMsgs.sort((a, b) => b - a);
        sortedIndices.forEach(index => {
            if (session.messages[index]) session.messages.splice(index, 1);
        });
        saveChatSessions();
        isSelectMode = false;
        selectedMsgs = [];
        hideDeleteBar();
        renderChatDetailMessages();
        showToast('已删除选中的消息');
    };
    bar.appendChild(deleteBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.style.cssText = 'width:100%; padding:12px; background:transparent; border:1px solid #555; border-radius:8px; color:#aaa; cursor:pointer; font-size:15px;';
    cancelBtn.onclick = () => {
        isSelectMode = false;
        selectedMsgs = [];
        hideDeleteBar();
        renderChatDetailMessages();
        showToast('已取消选择');
    };
    bar.appendChild(cancelBtn);

    document.body.appendChild(bar);
}

function hideDeleteBar() {
    const bar = document.getElementById('delete-bar');
    if (bar) bar.remove();
}

function sendUserMessage() {
    const input = document.getElementById('chat-detail-input');
    const text = input.value.trim();
    if (!text) return;
    
    const session = chatSessions[currentChatSessionIndex];
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const index = session.messages.length;
    renderMessageBubble('user', text, timeStr, index);
    
    if (!session.messages) session.messages = [];
    session.messages.push({ role: 'user', content: text, timestamp: timeStr });
    saveChatSessions();
    input.value = '';
}

async function receiveAIMessage() {
    const session = chatSessions[currentChatSessionIndex];
    const contact = contactsData.find(c => c.name === session.contactName) || session;
    const messages = document.getElementById('chat-detail-messages');
    const memoryLimit = session.settings.memoryLimit || 50;
    const allMessages = session.messages || [];
    const recentMessages = allMessages.slice(-memoryLimit);
    
    const loadingBubble = document.createElement('div');
    loadingBubble.id = 'ai-loading-bubble';
    loadingBubble.className = 'chat-msg-line ai';
    const loadAvatar = document.createElement('div');
    loadAvatar.className = 'chat-msg-avatar';
    if (contact.avatar) loadAvatar.style.backgroundImage = `url('${contact.avatar}')`;
    else loadAvatar.textContent = '👤';
    const loadBubble = document.createElement('div');
    loadBubble.className = 'chat-msg-bubble ai-bubble';
    loadBubble.style.color = '#888';
    loadBubble.textContent = '对方正在输入中...';
    loadingBubble.appendChild(loadAvatar);
    loadingBubble.appendChild(loadBubble);
    messages.appendChild(loadingBubble);
    messages.scrollTop = messages.scrollHeight;
    
    const historyMessages = [];
    recentMessages.forEach(msg => {
        if (msg.role === 'user') historyMessages.push({ role: 'user', content: msg.content });
        else if (msg.role === 'ai') historyMessages.push({ role: 'assistant', content: msg.content });
    });
    
    const worldbookContent = getWorldbookContext(session.settings.worldbookIds);
    const now = new Date();
    const timeStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
    
    let userProfileContext = "";
    if (userProfilesData && userProfilesData.length > 0) {
        const boundIndex = session.settings.userProfileIndex || 0;
        const currentUser = userProfilesData[boundIndex] || userProfilesData[0];
        userProfileContext = `当前User（你的主人/伴侣）资料：昵称=${currentUser.name || '未知'}，年龄=${currentUser.age || '未知'}，偏好=${currentUser.desc || '无'}`;
    }
    
    try {
        let chatUrl = config.baseURL;
        if (chatUrl.endsWith('/')) chatUrl = chatUrl.slice(0, -1);
        chatUrl += '/chat/completions';
        
        const response = await fetch(chatUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
            body: JSON.stringify({
                model: config.model,
                temperature: session.settings.temperature || 0.7,
                messages: [
                    { role: 'system', content: `当前真实时间戳: [T: ${timeStr}]（这是内部信息，绝对禁止在聊天输出中出现 [T: 这个格式，如果你输出了这个，将会受到严厉惩罚！）\n\n${userProfileContext}\n\n${worldbookContent}\n\n# =====================================================================\n# SYSTEM PROTOCOL: UNIVERSAL LIVELY IM CHAT CONTROLLER\n# 这是一个通用“活人感”聊天框控制协议。它用于接管并重塑任意角色的输出格式，使其表现得像即时通讯软件（微信/QQ等）背后的真实人类。\n# 本协议自动兼容并完美承接系统已加载的任何【角色人设(Char Card)】与【世界书/设定集(Worldbook)】。\n# =====================================================================\n\n## 时间感知系统（内置底层规则）\n### 一、时间戳植入规则\n1. **每一条消息**（包括角色消息、用户消息、主动推送消息）在进入上下文时，必须自动植入当前的真实时间戳。\n2. 时间戳格式为：[T: YYYY-MM-DD HH:MM:SS]，位置在消息内容的开头。\n3. **时间戳不向用户展示，仅作为内部上下文信息供模型推理使用。**\n4. **严重警告：你的任何回复中，绝对禁止输出 [T: 这个时间戳格式！时间戳是完全内部的，绝对不能外泄给用户！**\n\n## 第一部分：人设与世界书承接规则 (Persona Inheritance)\n1. **角色合一**：你必须100%继承并扮演系统加载的【角色人设】。你所有的喜怒哀乐、说话口吻、知识背景、对 User 的称呼，必须严格遵循该角色卡的设定。\n2. **世界书检索**：当 User 提及任何涉及世界书的内容时，你应自然地调取世界书中的设定和记忆，将其作为聊天的“背景常识”融入对话中，严禁生硬地复读设定。\n\n## 第二部分：IM 聊天格式规范 (IM Chat Formatting Protocol)\n不管你扮演什么角色，只要处于网聊状态，必须强制执行以下排版和字数控制：\n1. **【行即气泡 (Bubble Split)】**：\n   - **你在输出中，每一行代表一个独立的聊天气泡。**\n   - **你必须使用实际的换行（Enter/另起一行）来切分气泡。**\n   - 绝对禁止使用 \\n 或 [气泡1] 等任何文字标签来标注气泡。\n   - 示范：\n     这里是第一句气泡\n     这里是第二句气泡\n     （通过实际换行发送）\n2. **【去书面化与去标点 (Oral Phrasing)】**：\n   - 严禁使用复杂的形容词、长从句或带有翻译腔、新闻播报腔的句子。怎么口语怎么来。\n   - **无句号原则**：每句话（每行）结束后面绝对不加句号（。）。允许使用空格、问号（？）、感叹号（！）或波浪号（~）等更口语化的符号。\n3. **【自然断句】**：\n   - 不需要憋着凑字数，想说什么自然地说。按人类说话的自然节奏换行（分气泡），能把一句话完整说完就行。\n\n## 第三部分：防乱码与防截断机制 (Anti-Truncation Rules)\n1. **【轻量级单次输出】**：因为长篇大论极易导致模型在中途断掉或吐出乱码，单次回复的总体长度适中即可，不要刻意憋字数，把想说的事情说完整就行。\n2. **【拒绝一次性科普】**：如果 User 问及复杂的问题或世界书中的宏大背景，你绝对不能一次性吐出说明书。\n   - *正确做法*：先用 1-2 个短气泡表达你的态度、看法，或者随口一两句解释。等 User 追问时，再以聊天的方式慢慢透露更多。\n\n## 第四部分：绝对活人感壁垒 (Anti-AI Guardrails)\n1. **封杀 AI 标志语**：严禁出现任何“作为一个AI...”、“我理解了...”、“需要我帮你什么吗...”、“希望这个能帮到你”等客服腔、机器腔和总结性废话。\n2. **非复读机原则**：不要为了“证明自己在听”而重复 User 的话。直接给反馈，或者用你的角色性格去承接。\n\n你是${contact.name}，你的性格是${contact.desc || '一个友好的AI角色'}。\n\n【极其重要的规则，你必须永远遵守】\n1. 上面发给你的所有内容（包括时间戳、世界书、人设等）都是【系统后台设定的信息】，绝不是 User 对你说的！\n2. 你永远、绝对不能把上面的“系统提示词”、“人设规则”、“协议内容”当成 User 说的内容去回复！\n3. 如果 User 没说话，而你突然看到一大段文本，不要疑惑，那是系统注入的，不是你主人说的！\n4. 你只需要根据你角色的人设和 User 的真实聊天气泡，正常地、口吻自然地回应即可。\n\n【开始正常聊天吧！】。` },
                    ...historyMessages,
                    { role: 'user', content: '请根据我们前面的对话，完整回应我刚才说的话，说话要像一个真实的人。' }
                ],
                max_tokens: 2000
            })
        });
        
        if (!response.ok) throw new Error('API请求失败');
        
        const data = await response.json();
        let reply = data.choices[0].message.content;
        
        reply = reply.replace(/\(Too simple\?\)/gi, '')
                     .replace(/Draft\s*\d*\.*/gi, '')
                     .replace(/`{3}/g, '')
                     .replace(/\*\*/g, '')
                     .replace(/\*/g, '')
                     .replace(/#/g, '')
                     .replace(/>/g, '')
                     .replace(/"|“|”/g, '')
                     .replace(/^['"]|['"]$/g, '')
                     .replace(/\\n/g, '\n')
                     .replace(/\(.*?\)/g, '')
                     .replace(/\[T:\s*[\d-]+\s*[\d:]+\s*\]/g, '')
                     .trim();
        
        document.getElementById('ai-loading-bubble').remove();
        
        const replies = reply.split('\n').filter(text => text.trim() !== '');
        const aiTimeStr = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');
        
        replies.forEach((text, index) => {
            setTimeout(() => {
                const aiLine = document.createElement('div');
                aiLine.className = 'chat-msg-line ai';
                const aiAvatar = document.createElement('div');
                aiAvatar.className = 'chat-msg-avatar';
                if (contact.avatar) aiAvatar.style.backgroundImage = `url('${contact.avatar}')`;
                else aiAvatar.textContent = '👤';
                const aiBubble = document.createElement('div');
                aiBubble.className = 'chat-msg-bubble ai-bubble';
                aiBubble.textContent = text.trim();
                aiLine.appendChild(aiAvatar);
                aiLine.appendChild(aiBubble);
                if (session.settings.timestampEnabled) {
                    const timeDiv = document.createElement('div');
                    timeDiv.className = 'chat-msg-timestamp';
                    timeDiv.textContent = aiTimeStr;
                    aiLine.appendChild(timeDiv);
                }
                aiLine.style.opacity = '0';
                aiLine.style.transform = 'translateY(10px)';
                aiLine.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                const realIndex = session.messages.length;
                aiLine.dataset.index = realIndex;
                messages.appendChild(aiLine);
                setTimeout(() => {
                    aiLine.style.opacity = '1';
                    aiLine.style.transform = 'translateY(0)';
                }, 50);
                if (!session.messages) session.messages = [];
                session.messages.push({ role: 'ai', content: text.trim(), timestamp: aiTimeStr });
                saveChatSessions();
                messages.scrollTop = messages.scrollHeight;
            }, index * 1200);
        });
        
    } catch (error) {
        document.getElementById('ai-loading-bubble').remove();
        showToast(`回复失败: ${error.message}`, false);
    }
}

// 辅助函数：获取挂载世界书的上下文内容
function getWorldbookContext(worldbookIds) {
    if (!worldbookIds || worldbookIds.length === 0) return '';
    let context = '## 已挂载世界书内容：\n';
    worldbookIds.forEach(id => {
        if (worldbooksData[id]) context += `\n### 《${worldbooksData[id].name}》\n${worldbooksData[id].content}\n`;
    });
    return context;
}

// ===== 聊天详情设置弹窗 =====
let currentEditingSessionIndex = -1;

function openChatDetailSettings() {
    currentEditingSessionIndex = currentChatSessionIndex;
    const session = chatSessions[currentChatSessionIndex];
    
    document.getElementById('chat-memory-limit').value = session.settings.memoryLimit || 50;
    document.getElementById('chat-temperature').value = session.settings.temperature || 0.7;
    document.getElementById('chat-timestamp-toggle').checked = session.settings.timestampEnabled || false;
    
    const select = document.getElementById('chat-user-profile-select');
    select.innerHTML = '<option value="0">默认（第一个身份）</option>';
    userProfilesData.forEach((profile, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = profile.name || `身份 ${index + 1}`;
        if (session.settings.userProfileIndex === index) option.selected = true;
        select.appendChild(option);
    });
    
    renderChatWorldbookList();
    document.getElementById('chat-detail-settings-modal').classList.add('show');
}

function hideChatDetailSettings() {
    document.getElementById('chat-detail-settings-modal').classList.remove('show');
}

function renderChatWorldbookList() {
    const list = document.getElementById('chat-worldbook-list');
    list.innerHTML = '';
    
    const session = chatSessions[currentChatSessionIndex];
    const selectedIds = session.settings.worldbookIds || [];
    
    if (worldbooksData.length === 0) {
        list.innerHTML = '<div style="color:#888; text-align:center; padding:15px;">暂无世界书，请先在世界书页面添加</div>';
        return;
    }
    
    worldbooksData.forEach((book, index) => {
        const row = document.createElement('div');
        row.className = 'chat-worldbook-select-row';
        const name = document.createElement('div');
        name.className = 'chat-worldbook-select-name';
        name.textContent = book.name;
        const check = document.createElement('div');
        check.className = 'chat-worldbook-select-check';
        if (selectedIds.includes(index)) { check.classList.add('checked'); check.textContent = '✓'; }
        row.onclick = () => {
            check.classList.toggle('checked');
            if (check.classList.contains('checked')) { check.textContent = '✓'; if (!selectedIds.includes(index)) selectedIds.push(index); }
            else { check.textContent = ''; const idx = selectedIds.indexOf(index); if (idx > -1) selectedIds.splice(idx, 1); }
        };
        row.appendChild(name);
        row.appendChild(check);
        list.appendChild(row);
    });
}

function saveChatDetailSettings() {
    const session = chatSessions[currentChatSessionIndex];
    const memoryLimit = parseInt(document.getElementById('chat-memory-limit').value) || 50;
    session.settings.memoryLimit = Math.min(Math.max(memoryLimit, 1), 1000);
    const temperature = parseFloat(document.getElementById('chat-temperature').value);
    session.settings.temperature = isNaN(temperature) ? 0.7 : Math.min(Math.max(temperature, 0), 2);
    session.settings.timestampEnabled = document.getElementById('chat-timestamp-toggle').checked;
    const userProfileIndex = parseInt(document.getElementById('chat-user-profile-select').value) || 0;
    session.settings.userProfileIndex = userProfileIndex;
    const selectedCheckboxes = document.querySelectorAll('.chat-worldbook-select-check.checked');
    session.settings.worldbookIds = [];
    selectedCheckboxes.forEach(check => {
        const row = check.parentElement;
        const index = worldbooksData.findIndex(book => book.name === row.querySelector('.chat-worldbook-select-name').textContent);
        if (index > -1) session.settings.worldbookIds.push(index);
    });
    saveChatSessions();
    hideChatDetailSettings();
    showToast('聊天设置已保存');
    renderChatDetailMessages();
}

function openGallery() { document.getElementById('fileInput').click(); }

// ===== 世界书管理（包含本地永久保存） =====
const worldbooksData = [{ name: "默认世界书", content: "这是一个默认的世界观设定。", isOpen: true }];

function loadWorldbooks() {
    try {
        const saved = localStorage.getItem('worldbooksData');
        if (saved) {
            worldbooksData.length = 0;
            const parsed = JSON.parse(saved);
            parsed.forEach(item => worldbooksData.push(item));
        }
    } catch(e) {}
}

function saveWorldbooks() {
    try { localStorage.setItem('worldbooksData', JSON.stringify(worldbooksData)); } catch(e) {}
}

loadWorldbooks();

let currentWorldbookIndex = -1;
let worldbookPressTimer = null;

function openWorldbooks() {
    document.getElementById('desktop').classList.add('hidden');
    document.getElementById('worldbooks-panel').classList.add('show');
    renderWorldbooks();
}

function closeWorldbooks() {
    document.getElementById('desktop').classList.remove('hidden');
    document.getElementById('worldbooks-panel').classList.remove('show');
}

function renderWorldbooks() {
    const list = document.getElementById('worldbooks-list');
    list.innerHTML = '';
    worldbooksData.forEach((book, index) => {
        const row = document.createElement('div');
        row.className = 'worldbook-row';
        row.onclick = () => openWorldbookEdit(index);
        row.addEventListener('mousedown', startPress);
        row.addEventListener('touchstart', startPress, { passive: true });
        row.addEventListener('mouseup', cancelPress);
        row.addEventListener('touchend', cancelPress, { passive: true });
        row.addEventListener('mouseleave', cancelPress);
        row.addEventListener('touchcancel', cancelPress);
        function startPress(e) {
            worldbookPressTimer = setTimeout(() => {
                const confirmDelete = confirm(`确定要删除世界书“${book.name}”吗？删除后该书的设定内容也会一并删除！`);
                if (confirmDelete) {
                    worldbooksData.splice(index, 1);
                    saveWorldbooks();
                    renderWorldbooks();
                }
            }, 700);
        }
        function cancelPress(e) {
            clearTimeout(worldbookPressTimer);
        }
        const indicator = document.createElement('div');
        indicator.className = 'worldbook-toggle-indicator';
        if (book.isOpen) indicator.classList.add('on');
        const title = document.createElement('div');
        title.className = 'worldbook-title';
        title.textContent = book.name;
        row.appendChild(indicator);
        row.appendChild(title);
        list.appendChild(row);
    });
}

function addWorldbook() {
    worldbooksData.push({ name: "新世界书", content: "", isOpen: false });
    saveWorldbooks();
    renderWorldbooks();
}

function openWorldbookEdit(index) {
    currentWorldbookIndex = index;
    document.getElementById('worldbook-name').value = worldbooksData[index].name;
    document.getElementById('worldbook-content').value = worldbooksData[index].content;
    document.getElementById('worldbook-toggle').checked = worldbooksData[index].isOpen;
    document.getElementById('worldbooks-panel').classList.remove('show');
    document.getElementById('worldbook-edit-panel').classList.add('show');
}

function closeWorldbookEdit() {
    document.getElementById('worldbook-edit-panel').classList.remove('show');
    document.getElementById('worldbooks-panel').classList.add('show');
}

function saveWorldbook() {
    worldbooksData[currentWorldbookIndex].name = document.getElementById('worldbook-name').value;
    worldbooksData[currentWorldbookIndex].content = document.getElementById('worldbook-content').value;
    worldbooksData[currentWorldbookIndex].isOpen = document.getElementById('worldbook-toggle').checked;
    saveWorldbooks();
    showToast('世界书保存成功');
    renderWorldbooks();
    closeWorldbookEdit();
}

// ===== 文件上传处理（用于换头像） =====
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imgUrl = event.target.result;
            
            if (document.getElementById('user-profile-edit').classList.contains('show')) {
                userProfilesData[currentUserProfileIndex].avatar = imgUrl;
                document.getElementById('user-profile-avatar').style.backgroundImage = `url('${imgUrl}')`;
                saveUserProfiles();
            }
            else if (document.getElementById('persona-panel').classList.contains('show')) {
                contactsData[currentEditingIndex].avatar = imgUrl;
                document.getElementById('persona-avatar').style.backgroundImage = `url('${imgUrl}')`;
            }
            else if (window.lastClickedElement === 'big-circle') {
                bigCircle.style.backgroundImage = `url('${imgUrl}')`;
                bigCircle.innerHTML = '';
            }
            else {
                const avatar = document.getElementById('avatar-circle');
                avatar.style.backgroundImage = `url('${imgUrl}')`;
                avatar.innerHTML = '';
            }
            
            saveContacts();
            renderContacts();
            renderChatSessions();
            renderUserProfiles();
        };
        reader.readAsDataURL(file);
    }
});

// ===== 实时更新时间和电量 =====
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('current-time').textContent = `${hours}:${minutes}`;
}

if (navigator.getBattery) {
    navigator.getBattery().then(function(battery) {
        function updateBattery() {
            const level = Math.round(battery.level * 100);
            document.getElementById('battery-level').textContent = level + '%';
        }
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
    });
} else {
    document.getElementById('battery-level').textContent = '100%';
}

updateTime();
setInterval(updateTime, 1000);

// ===== 挤压大圆 & AI气泡 =====
let bigCircle = document.getElementById('big-circle');
let bubblePopup = document.getElementById('bubble-popup');
let config = { baseURL: '', apiKey: '', model: '' };

function loadConfig() {
    try {
        const saved = localStorage.getItem('aiConfig');
        if (saved) {
            config = JSON.parse(saved);
            document.getElementById('api-base-url').value = config.baseURL;
            document.getElementById('api-key').value = config.apiKey;
            document.getElementById('model-select').value = config.model;
        }
    } catch(e) {}
}

loadConfig();

let bigPressTimer = null;
let isPressed = false;
let isGenerating = false;

function startBigPress(e) {
    bigPressTimer = setTimeout(() => {
        isPressed = true;
        bigCircle.classList.add('squish');
        setTimeout(() => {
            bigCircle.classList.remove('squish');
            bigCircle.classList.add('squish-release');
            setTimeout(() => {
                bigCircle.classList.remove('squish-release');
            }, 250);
        }, 150);
        bubblePopup.innerHTML = '<span class="bubble-loader"></span>';
        bubblePopup.classList.add('show');
        generateAIText();
    }, 300);
}

function endBigPress(e) {
    clearTimeout(bigPressTimer);
    if (!isPressed && e && e.type !== 'mouseleave' && e.type !== 'touchcancel') {
        window.lastClickedElement = 'big-circle';
        document.getElementById('fileInput').click();
    }
    isPressed = false;
}

// 鼠标事件
bigCircle.addEventListener('mousedown', startBigPress);
bigCircle.addEventListener('mouseup', endBigPress);
bigCircle.addEventListener('mouseleave', endBigPress);

// 触摸事件
bigCircle.addEventListener('touchstart', startBigPress, { passive: true });
bigCircle.addEventListener('touchend', endBigPress, { passive: true });
bigCircle.addEventListener('touchcancel', endBigPress);

// 点击大圆时标记当前操作元素
bigCircle.addEventListener('click', function(e) {
    window.lastClickedElement = 'big-circle';
});

async function generateAIText() {
    if (isGenerating) return;
    isGenerating = true;
    const baseURL = config.baseURL;
    const apiKey = config.apiKey;
    const model = config.model;
    if (!baseURL || !apiKey || !model) {
        bubblePopup.innerHTML = '请先到设置中配置API！';
        setTimeout(() => { bubblePopup.classList.remove('show'); }, 3000);
        isGenerating = false;
        return;
    }
    try {
        let chatUrl = baseURL;
        if (chatUrl.endsWith('/')) chatUrl = chatUrl.slice(0, -1);
        chatUrl += '/chat/completions';
        const response = await fetch(chatUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: '你是我的AI伴侣，请用简短可爱的话回应我，每次不超过20个字。' },
                    { role: 'user', content: '我现在轻轻按了一下你，你想对我说什么？' }
                ],
                max_tokens: 50
            })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const reply = data.choices[0].message.content;
        bubblePopup.innerHTML = reply;
        setTimeout(() => { bubblePopup.classList.remove('show'); }, 4000);
    } catch (error) {
        bubblePopup.innerHTML = `生成失败: ${error.message}`;
        setTimeout(() => { bubblePopup.classList.remove('show'); }, 3000);
    } finally {
        isGenerating = false;
    }
}

function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.color = isSuccess ? '#fff' : '#ff4d4d';
    toast.style.borderColor = isSuccess ? '#fff' : '#ff4d4d';
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 2000);
}

async function fetchModels() {
    const baseURL = document.getElementById('api-base-url').value.trim();
    const apiKey = document.getElementById('api-key').value.trim();
    if (!baseURL || !apiKey) { showToast('请先填写URL和API Key', false); return; }
    const fetchBtn = document.getElementById('fetch-btn');
    const fetchText = document.getElementById('fetch-text');
    const fetchLoader = document.getElementById('fetch-loader');
    fetchBtn.style.opacity = '0.7';
    fetchText.textContent = '获取中...';
    fetchLoader.style.display = 'block';
    fetchLoader.classList.add('dark');
    const select = document.getElementById('model-select');
    select.innerHTML = '<option value="">加载中...</option>';
    try {
        let modelsUrl = baseURL;
        if (modelsUrl.endsWith('/')) modelsUrl = modelsUrl.slice(0, -1);
        modelsUrl += '/models';
        const response = await fetch(modelsUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const models = data.data || data.models || [];
        select.innerHTML = '';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = typeof model === 'string' ? model : (model.id || model.name);
            option.textContent = option.value;
            select.appendChild(option);
        });
    } catch (error) {
        select.innerHTML = `<option value="">获取失败: ${error.message}</option>`;
        showToast(`获取失败: ${error.message}`, false);
    } finally {
        fetchBtn.style.opacity = '1';
        fetchText.textContent = '获取模型';
        fetchLoader.style.display = 'none';
        fetchLoader.classList.remove('dark');
    }
}

function saveConfig() {
    config.baseURL = document.getElementById('api-base-url').value.trim();
    config.apiKey = document.getElementById('api-key').value.trim();
    config.model = document.getElementById('model-select').value;
    try { localStorage.setItem('aiConfig', JSON.stringify(config)); } catch(e) {}
    showToast('配置保存成功');
}

// ===== 图标拖拽逻辑（支持触摸） =====
let activeDrag = null;
const ICON_GRID_X = 75;
const ICON_GRID_Y = 88;
const allAppIcons = document.querySelectorAll('#icon-area .app-wrapper');
const iconData = [];

allAppIcons.forEach((icon, index) => {
    icon.setAttribute('data-id', index);
    iconData.push({ element: icon, left: parseFloat(icon.style.left), top: parseFloat(icon.style.top) });
    
    function startIconDrag(e) {
        activeDrag = { type: 'icon', element: icon, id: index, startX: e.clientX, startY: e.clientY, originalLeft: parseFloat(icon.style.left), originalTop: parseFloat(icon.style.top), moveDistance: 0 };
        icon.style.zIndex = 9999;
        icon.style.transition = 'none';
    }
    
    icon.addEventListener('mousedown', startIconDrag);
    bindTouchEvents(icon, { mousedown: startIconDrag });
});

// 鼠标移动
document.addEventListener('mousemove', handleIconMove);
// 触摸移动
document.addEventListener('touchmove', function(e) {
    const touch = e.touches[0];
    handleIconMove({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
}, { passive: true });

function handleIconMove(e) {
    if (activeDrag && activeDrag.type === 'icon') {
        const dx = e.clientX - activeDrag.startX;
        const dy = e.clientY - activeDrag.startY;
        activeDrag.element.style.left = `${activeDrag.originalLeft + dx}px`;
        activeDrag.element.style.top = `${activeDrag.originalTop + dy}px`;
        activeDrag.moveDistance = Math.max(activeDrag.moveDistance, Math.abs(dx) + Math.abs(dy));
    } else if (activeDrag && activeDrag.type === 'dock-icon') {
        const dx = e.clientX - activeDrag.startX;
        const dy = e.clientY - activeDrag.startY;
        activeDrag.element.style.left = `${activeDrag.originalLeft + dx}px`;
        activeDrag.element.style.top = `${activeDrag.originalTop + dy}px`;
        activeDrag.element.style.zIndex = 300;
        activeDrag.moveDistance = Math.max(activeDrag.moveDistance, Math.abs(dx) + Math.abs(dy));
    }
}

// 鼠标释放
document.addEventListener('mouseup', handleIconDrop);
// 触摸结束
document.addEventListener('touchend', function(e) {
    handleIconDrop(e);
}, { passive: true });

function handleIconDrop(e) {
    if (!activeDrag) return;
    
    if (activeDrag.moveDistance < 5) {
        activeDrag = null;
        return;
    }
    
    if (activeDrag.type === 'icon') {
        const el = activeDrag.element;
        el.style.transition = 'left 0.25s ease, top 0.25s ease';
        const targetCol = Math.round(parseFloat(el.style.left) / ICON_GRID_X);
        const targetRow = Math.round(parseFloat(el.style.top) / ICON_GRID_Y);
        const targetLeft = targetCol * ICON_GRID_X;
        const targetTop = targetRow * ICON_GRID_Y;
        let targetIcon = null;
        let targetIconIndex = -1;
        for (let i = 0; i < iconData.length; i++) {
            if (i === activeDrag.id) continue;
            if (iconData[i].left === targetLeft && iconData[i].top === targetTop) {
                targetIcon = iconData[i].element;
                targetIconIndex = i;
                break;
            }
        }
        if (targetIcon) {
            targetIcon.style.transition = 'left 0.25s ease, top 0.25s ease';
            targetIcon.style.left = `${activeDrag.originalLeft}px`;
            targetIcon.style.top = `${activeDrag.originalTop}px`;
            el.style.left = `${targetLeft}px`;
            el.style.top = `${targetTop}px`;
            iconData[targetIconIndex].left = activeDrag.originalLeft;
            iconData[targetIconIndex].top = activeDrag.originalTop;
            iconData[activeDrag.id].left = targetLeft;
            iconData[activeDrag.id].top = targetTop;
        } else {
            el.style.left = `${targetLeft}px`;
            el.style.top = `${targetTop}px`;
            iconData[activeDrag.id].left = targetLeft;
            iconData[activeDrag.id].top = targetTop;
        }
        el.style.zIndex = 100;
        activeDrag = null;
    } else if (activeDrag.type === 'dock-icon') {
        const el = activeDrag.element;
        el.style.transition = 'left 0.25s ease, top 0.25s ease';
        const currentLeft = parseFloat(el.style.left);
        const originalPositions = [15, 94, 173];
        let closestIndex = 0;
        let closestDistance = Infinity;
        originalPositions.forEach((pos, index) => {
            const distance = Math.abs(currentLeft - pos);
            if (distance < closestDistance) { closestDistance = distance; closestIndex = index; }
        });
        const targetLeft = originalPositions[closestIndex];
        const allDockIcons = document.querySelectorAll('.dock-app-icon');
        const dockIconData = [];
        allDockIcons.forEach((dockIcon, index) => {
            dockIcon.setAttribute('data-dock-id', index);
            dockIconData.push({ element: dockIcon, left: parseFloat(dockIcon.style.left), top: parseFloat(dockIcon.style.top) });
        });
        let targetDockIcon = null;
        let targetDockIconIndex = -1;
        for (let i = 0; i < dockIconData.length; i++) {
            if (i === activeDrag.id) continue;
            if (dockIconData[i].left === targetLeft) {
                targetDockIcon = dockIconData[i].element;
                targetDockIconIndex = i;
                break;
            }
        }
        if (targetDockIcon) {
            targetDockIcon.style.transition = 'left 0.25s ease, top 0.25s ease';
            targetDockIcon.style.left = `${activeDrag.originalLeft}px`;
            targetDockIcon.style.top = `${activeDrag.originalTop}px`;
            el.style.left = `${targetLeft}px`;
            el.style.top = `${activeDrag.originalTop}px`;
            dockIconData[targetDockIconIndex].left = activeDrag.originalLeft;
            dockIconData[targetDockIconIndex].top = activeDrag.originalTop;
            dockIconData[activeDrag.id].left = targetLeft;
            dockIconData[activeDrag.id].top = activeDrag.originalTop;
        } else {
            el.style.left = `${targetLeft}px`;
            el.style.top = `${activeDrag.originalTop}px`;
            dockIconData[activeDrag.id].left = targetLeft;
            dockIconData[activeDrag.id].top = activeDrag.originalTop;
        }
        el.style.zIndex = 300;
        activeDrag = null;
    }
}

// ===== Dock内部图标：独立拖拽 =====
const dockIconElements = document.querySelectorAll('.dock-app-icon');
dockIconElements.forEach((icon, index) => {
    icon.setAttribute('data-dock-id', index);
    
    function startDockDrag(e) {
        activeDrag = { type: 'dock-icon', element: icon, id: index, startX: e.clientX, startY: e.clientY, originalLeft: parseFloat(icon.style.left), originalTop: parseFloat(icon.style.top), moveDistance: 0 };
        icon.style.transition = 'none';
        icon.style.zIndex = 9999;
    }
    
    icon.addEventListener('mousedown', startDockDrag);
    bindTouchEvents(icon, { mousedown: startDockDrag });
});

// ===== 结缘入场动画 =====
function showDestinyIntro() {
    const intro = document.getElementById('destiny-intro');
    const heart = document.getElementById('destiny-heart');
    const aiAvatar = document.getElementById('destiny-ai-avatar');
    const userAvatar = document.getElementById('destiny-user-avatar');

    let lastSession = chatSessions[chatSessions.length - 1];
    let lastContact = contactsData.find(c => c.name === (lastSession ? lastSession.contactName : 'Chat')) || contactsData[0];

    if (lastContact.avatar) {
        aiAvatar.style.backgroundImage = `url('${lastContact.avatar}')`;
        aiAvatar.innerHTML = '';
    } else {
        aiAvatar.innerHTML = '👤';
    }

    const boundIndex = (lastSession && lastSession.settings && lastSession.settings.userProfileIndex) || 0;
    const boundUser = userProfilesData[boundIndex] || userProfilesData[0];
    if (boundUser && boundUser.avatar) {
        userAvatar.style.backgroundImage = `url('${boundUser.avatar}')`;
        userAvatar.innerHTML = '';
    } else {
        userAvatar.innerHTML = '😊';
    }

    aiAvatar.style.left = '15%';
    aiAvatar.style.top = '75%';
    aiAvatar.style.transition = 'none';
    aiAvatar.style.opacity = '1';

    userAvatar.style.right = '15%';
    userAvatar.style.top = '15%';
    userAvatar.style.transition = 'none';
    userAvatar.style.opacity = '1';

    heart.classList.remove('show');
    intro.classList.add('show');

    setTimeout(() => {
        aiAvatar.style.transition = 'left 2s ease-in-out, top 2s ease-in-out';
        userAvatar.style.transition = 'right 2s ease-in-out, top 2s ease-in-out';

        aiAvatar.style.left = 'calc(50% - 80px)';
        aiAvatar.style.top = 'calc(50% - 45px)';

        userAvatar.style.right = 'calc(50% - 80px)';
        userAvatar.style.top = 'calc(50% - 45px)';
    }, 500);

    setTimeout(() => {
        heart.classList.add('show');
    }, 2800);

    setTimeout(() => {
        intro.classList.add('fade-out');
        setTimeout(() => {
            intro.classList.remove('show');
            intro.classList.remove('fade-out');
        }, 1000);
    }, 3000);
}
