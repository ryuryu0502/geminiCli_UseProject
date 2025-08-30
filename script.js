'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const groupForm = document.getElementById('group-form');
    const contractForm = document.getElementById('contract-form');
    const groupSelect = document.getElementById('group-select');
    const contractListContainer = document.getElementById('contract-list-container');
    const exportCsvButton = document.getElementById('export-csv');
    
    const STORAGE_KEY = 'mnp-app-data';

    // アプリケーションの全データを保持するオブジェクト
    let appData = {
        groups: [] // {id, name, contracts: []}
    };

    // --- データ管理 --- //

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    }

    function loadData() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            appData = JSON.parse(savedData);
        }
    }

    // --- 描画処理 --- //

    function render() {
        renderGroupOptions();
        renderContractList();
    }

    function renderGroupOptions() {
        groupSelect.innerHTML = '';
        if (appData.groups.length === 0) {
            groupSelect.innerHTML = '<option value="">先にグループを作成してください</option>';
            groupSelect.disabled = true;
            return;
        }
        groupSelect.disabled = false;
        appData.groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            groupSelect.appendChild(option);
        });
    }

    function renderContractList() {
        contractListContainer.innerHTML = '';
        if (appData.groups.length === 0) {
            contractListContainer.innerHTML = '<p>表示するグループがありません。</p>';
            return;
        }

        appData.groups.forEach((group, groupIndex) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group-container';
            
            const groupHeader = document.createElement('h3');
            groupHeader.textContent = group.name;
            groupDiv.appendChild(groupHeader);

            if (group.contracts && group.contracts.length > 0) {
                group.contracts.forEach((contract, contractIndex) => {
                    const item = document.createElement('div');
                    item.className = 'contract-item';
                    item.innerHTML = `
                        <div class="details">
                            <strong>${contract.name}</strong> (${contract.phoneNumber}) - ${contract.carrier}
                        </div>
                        <button class="delete-btn" data-group-index="${groupIndex}" data-contract-index="${contractIndex}">削除</button>
                    `;
                    groupDiv.appendChild(item);
                });
            } else {
                const noContract = document.createElement('p');
                noContract.textContent = 'このグループには契約情報がありません。';
                noContract.className = 'no-contract-message';
                groupDiv.appendChild(noContract);
            }
            contractListContainer.appendChild(groupDiv);
        });
    }

    // --- イベントリスナー --- //

    groupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const groupNameInput = document.getElementById('group-name');
        const groupName = groupNameInput.value.trim();
        if (!groupName) {
            alert('グループ名を入力してください。');
            return;
        }

        appData.groups.push({
            id: Date.now(),
            name: groupName,
            contracts: []
        });

        saveData();
        render();
        groupNameInput.value = '';
    });

    contractForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const groupId = parseInt(groupSelect.value, 10);
        const nameInput = document.getElementById('customer-name');
        const phoneInput = document.getElementById('phone-number');
        const carrierInput = document.getElementById('carrier');

        const name = nameInput.value.trim();
        const phoneNumber = phoneInput.value.trim();

        if (appData.groups.length === 0) {
            alert('追加先のグループを先に作成してください。');
            return;
        }
        if (!name) {
            alert('名前を入力してください。');
            return;
        }
        if (!phoneNumber) {
            alert('電話番号を入力してください。');
            return;
        }

        const targetGroup = appData.groups.find(g => g.id === groupId);
        if (targetGroup) {
            targetGroup.contracts.push({
                name: name,
                phoneNumber: phoneNumber,
                carrier: carrierInput.value
            });
            saveData();
            render();
            contractForm.reset();
        }
    });

    contractListContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const groupIndex = parseInt(event.target.dataset.groupIndex, 10);
            const contractIndex = parseInt(event.target.dataset.contractIndex, 10);

            if (!isNaN(groupIndex) && !isNaN(contractIndex)) {
                appData.groups[groupIndex].contracts.splice(contractIndex, 1);
                saveData();
                render();
            }
        }
    });
    
    exportCsvButton.addEventListener('click', () => {
        const allContracts = appData.groups.flatMap(g => 
            g.contracts.map(c => ({ ...c, groupName: g.name }))
        );

        if (allContracts.length === 0) {
            alert('エクスポートするデータがありません。');
            return;
        }

        const headers = ['グループ名', '名前', '電話番号', '移転元キャリア'];
        const rows = allContracts.map(c => [c.groupName, c.name, c.phoneNumber, c.carrier]);

        let csvContent = headers.join(',') + '\r\n';
        rows.forEach(rowArray => {
            const newRow = rowArray.map(cell => {
                const stringCell = String(cell || '');
                return stringCell.includes(',') ? `"${stringCell}"` : stringCell;
            });
            csvContent += newRow.join(',') + '\r\n';
        });

        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'contracts.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // --- 初期化処理 --- //
    function init() {
        loadData();
        render();
    }

    init();
});