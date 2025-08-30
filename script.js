'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const contractForm = document.getElementById('contract-form');
    const contractList = document.getElementById('contract-list');
    const exportCsvButton = document.getElementById('export-csv');
    const STORAGE_KEY = 'mnp-contracts';

    // アプリケーションのデータを保持する配列
    let contracts = [];

    /**
     * データをlocalStorageに保存する
     */
    function saveContracts() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
    }

    /**
     * localStorageからデータを読み込む
     */
    function loadContracts() {
        const savedContracts = localStorage.getItem(STORAGE_KEY);
        if (savedContracts) {
            contracts = JSON.parse(savedContracts);
        }
    }

    /**
     * 契約情報を画面に描画する関数
     */
    function renderContracts() {
        // 一覧をクリア
        contractList.innerHTML = '';

        if (contracts.length === 0) {
            contractList.innerHTML = '<p>登録されている契約情報はありません。</p>';
            return;
        }

        contracts.forEach((contract, index) => {
            const item = document.createElement('div');
            item.className = 'contract-item';
            item.innerHTML = `
                <div class=\"details\">
                    <strong>${contract.name}</strong> (${contract.phoneNumber}) - ${contract.carrier}
                </div>
                <button class=\"delete-btn\" data-index=\" ${index}\">削除</button>
            `;
            contractList.appendChild(item);
        });
    }

    /**
     * フォーム送信時の処理
     */
    contractForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nameInput = document.getElementById('customer-name');
        const phoneInput = document.getElementById('phone-number');
        const carrierInput = document.getElementById('carrier');

        // 入力値の検証
        const name = nameInput.value.trim();
        const phoneNumber = phoneInput.value.trim();

        if (!name) {
            alert('名前を入力してください。');
            return;
        }
        if (!phoneNumber) {
            alert('電話番号を入力してください。');
            return;
        }

        const newContract = {
            name: name,
            phoneNumber: phoneNumber,
            carrier: carrierInput.value
        };

        contracts.push(newContract);
        saveContracts(); // データを保存
        renderContracts();

        contractForm.reset();
    });

    /**
     * 削除ボタンの処理（イベント委任）
     */
    contractList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const index = parseInt(event.target.dataset.index, 10);
            contracts.splice(index, 1);
            saveContracts(); // データを保存
            renderContracts();
        }
    });
    
    /**
     * CSVエクスポート処理
     */
    exportCsvButton.addEventListener('click', () => {
        if (contracts.length === 0) {
            alert('エクスポートするデータがありません。');
            return;
        }

        // CSVのヘッダーを定義
        const headers = ['名前', '電話番号', '移転元キャリア'];
        // CSVの行データを作成
        const rows = contracts.map(c => [c.name, c.phoneNumber, c.carrier]);

        // ヘッダーと行データを結合
        let csvContent = headers.join(',') + '\n';
        rows.forEach(rowArray => {
            const newRow = rowArray.map(cell => {
                const stringCell = String(cell || '');
                if (stringCell.includes(',')) {
                    return `"${stringCell}"`;
                }
                return stringCell;
            });
            csvContent += newRow.join(',') + '\n';
        });

        // BOMを追加してExcelでの文字化けを防ぐ
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'contracts.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 初期化処理
    function init() {
        loadContracts();
        renderContracts();
    }

    init();
});
