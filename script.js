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
            item.innerHTML = "\n                <div class=\"details\">
                    <strong>${contract.name}</strong> (${contract.phoneNumber}) - ${contract.carrier}
                </div>
                <button class=\"delete-btn\" data-index=\"$" + index + "\">削除</button>
            ";
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

        const newContract = {
            name: nameInput.value,
            phoneNumber: phoneInput.value,
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
        // TODO: CSVエクスポート機能を実装する
        alert('CSVエクスポート機能は未実装です。');
    });

    // 初期化処理
    function init() {
        loadContracts();
        renderContracts();
    }

    init();
});
