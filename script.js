// 表示モードとソート状態の管理
let isShortFormat = false;
let currentSortKey = 'money'; 

// 数値を K や M に変換する関数
function formatNumber(num) {
    if (!isShortFormat) return num.toLocaleString();
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ソート用関数：ヘッダーをクリックした時に呼ばれる
window.sortTable = function(key) {
    currentSortKey = key;
    window.loadStats();
};

// 表記切り替えボタン用関数
window.toggleFormat = function() {
    isShortFormat = !isShortFormat;
    const btn = document.getElementById('formatBtn');
    if (btn) btn.innerText = isShortFormat ? "通常表記に戻す" : "K/M表記に切り替え";
    window.loadStats();
};

window.loadStats = async function() {
    try {
        const response = await fetch(`team_stats.json?t=${new Date().getTime()}`);
        const rootData = await response.json();
        
        const tbody = document.querySelector('#statsTable tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (rootData.lastUpdated) {
            const lastUpdated = new Date(rootData.lastUpdated).toLocaleString();
            document.getElementById('time').innerText = `データ最終取得時刻: ${lastUpdated}`;
        }

        const players = rootData.players || [];
        
        let totalMoney = 0;
        let totalShards = 0;
        let totalKills = 0;
        let totalDeaths = 0;

        // ソート処理
        players.sort((a, b) => {
            let valA = a[currentSortKey] || 0;
            let valB = b[currentSortKey] || 0;
            // 名前の場合は昇順、数字の場合は降順（大きい順）
            if (currentSortKey === 'name') return valA.localeCompare(valB);
            return Number(valB) - Number(valA);
        });

        players.forEach(player => {
            const m = parseInt(player.money) || 0;
            const s = parseInt(player.shards) || 0;
            const k = parseInt(player.kills) || 0;
            const d = parseInt(player.deaths) || 0;

            totalMoney += m;
            totalShards += s;
            totalKills += k;
            totalDeaths += d;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${player.name || 'Unknown'}</td>
                <td>${formatNumber(m)}</td>
                <td>${formatNumber(s)}</td>
                <td>${k.toLocaleString()}</td>
                <td>${d.toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });

        // 合計行の追加
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `
            <td>TEAM TOTAL</td>
            <td>${formatNumber(totalMoney)}</td>
            <td>${formatNumber(totalShards)}</td>
            <td>${totalKills.toLocaleString()}</td>
            <td>${totalDeaths.toLocaleString()}</td>
        `;
        tbody.appendChild(totalRow);

    } catch (e) {
        console.error("読み込み失敗:", e);
    }
};

window.onload = window.loadStats;