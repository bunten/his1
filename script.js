
const START_YEAR = 1;
const END_YEAR = 2026;

// 日本史の時代区分
// 年代は学習用の目安
const eras = [
    { name: "弥生時代", start: 1, end: 250, color: "#dbeafe" },
    { name: "古墳時代", start: 250, end: 538, color: "#bfdbfe" },
    { name: "飛鳥時代", start: 538, end: 710, color: "#d1fae5" },
    { name: "奈良時代", start: 710, end: 794, color: "#a7f3d0" },
    { name: "平安時代", start: 794, end: 1185, color: "#fef3c7" },
    { name: "鎌倉時代", start: 1185, end: 1333, color: "#fde68a" },
    { name: "室町時代", start: 1333, end: 1573, color: "#fed7aa" },
    { name: "安土桃山時代", start: 1573, end: 1603, color: "#fecaca" },
    { name: "江戸時代", start: 1603, end: 1868, color: "#fbcfe8" },
    { name: "明治時代", start: 1868, end: 1912, color: "#ddd6fe" },
    { name: "大正時代", start: 1912, end: 1926, color: "#c7d2fe" },
    { name: "昭和時代", start: 1926, end: 1989, color: "#bfdbfe" },
    { name: "平成時代", start: 1989, end: 2019, color: "#bbf7d0" },
    { name: "令和時代", start: 2019, end: 2026, color: "#fde68a" }
];

// 最初に表示する歴史トピック
const initialTopics = [
    { id: 1, name: "漢委奴国王の金印", year: 57 },
    { id: 2, name: "卑弥呼が魏に使いを送る", year: 239 },
    { id: 3, name: "大化の改新", year: 645 },
    { id: 4, name: "平城京に都を移す", year: 710 },
    { id: 5, name: "平安京に都を移す", year: 794 },
    { id: 6, name: "承久の乱", year: 1221 },
    { id: 7, name: "応仁の乱", year: 1467 },
    { id: 8, name: "江戸幕府の成立", year: 1603 },
    { id: 9, name: "寛政の改革", year: 1787 },
    { id: 10, name: "明治維新", year: 1868 },
    { id: 11, name: "日清戦争", year: 1894 },
    { id: 12, name: "日本国憲法の施行", year: 1947 },
    { id: 13, name: "東京オリンピック", year: 1964 },
    { id: 14, name: "平成の始まり", year: 1989 },
    { id: 15, name: "令和の始まり", year: 2019 }
];

const STORAGE_KEY = "japaneseHistoryTimeline";

// 保存したデータを読み込む
let topics;

try {
    const saved = localStorage.getItem(STORAGE_KEY);

    topics = saved
        ? JSON.parse(saved)
        : initialTopics.map(t => ({ ...t }));

    if (
        !Array.isArray(topics) ||
        !topics.every(t =>
            t &&
            Number.isInteger(Number(t.year)) &&
            Number(t.year) >= START_YEAR &&
            Number(t.year) <= END_YEAR &&
            typeof t.name === "string"
        )
    ) {
        topics = initialTopics.map(t => ({ ...t }));
    }
} catch (error) {
    topics = initialTopics.map(t => ({ ...t }));
}

// 次に使うID
let nextId = Math.max(
    0,
    ...topics.map(t => Number(t.id) || 0)
) + 1;

// HTMLの部品を取得
const timeline = document.getElementById("timeline");
const topicList = document.getElementById("topicList");
const topicInput = document.getElementById("topic");
const yearInput = document.getElementById("year");
const eraPreview = document.getElementById("eraPreview");
const message = document.getElementById("message");

// 年号から時代名を判定する
function getEraName(year) {
    const era = eras.find((item, index) => {
        if (index === eras.length - 1) {
            return year >= item.start && year <= item.end;
        }

        return year >= item.start && year < item.end;
    });

    return era ? era.name : "時代不明";
}

// 年号から時代の色を取得する
function getEraColor(year) {
    const era = eras.find((item, index) => {
        if (index === eras.length - 1) {
            return year >= item.start && year <= item.end;
        }

        return year >= item.start && year < item.end;
    });

    return era ? era.color : "#eeeeee";
}

// 年号を年表上の位置に変換する
function getPosition(year) {
    return (
        (year - START_YEAR) /
        (END_YEAR - START_YEAR)
    ) * 100;
}

// 入力中の年号から時代名を表示する
function updateEraPreview() {
    const value = yearInput.value;

    if (value === "") {
        eraPreview.textContent = "年号を入力してください";
        return;
    }

    const year = Number(value);

    if (
        !Number.isInteger(year) ||
        year < START_YEAR ||
        year > END_YEAR
    ) {
        eraPreview.textContent = "対象範囲外です";
        return;
    }

    eraPreview.textContent = getEraName(year);
}

// 左側の年表を作成する
function drawTimeline() {
    timeline.replaceChildren();

    // 時代名の帯
    const eraRow = document.createElement("div");
    eraRow.className = "era-row";

    eras.forEach(era => {
        const box = document.createElement("div");
        box.className = "era";

        const width =
            (era.end - era.start) /
            (END_YEAR - START_YEAR) * 100;

        box.style.width = width + "%";
        box.style.backgroundColor = era.color;

        const name = document.createElement("strong");
        name.textContent = era.name;

        const years = document.createElement("span");
        years.textContent = `${era.start}〜${era.end}年`;

        box.append(name, years);
        eraRow.appendChild(box);
    });

    timeline.appendChild(eraRow);

    // 出来事の表示エリア
    const eventArea = document.createElement("div");
    eventArea.className = "event-area";

    const line = document.createElement("div");
    line.className = "event-line";

    eventArea.appendChild(line);

    // 発生年の古い順に並べる
    const sortedTopics = [...topics].sort(
        (a, b) => a.year - b.year
    );

    sortedTopics.forEach((topic, index) => {
        const position = getPosition(topic.year);

        // 出来事のカード
        const event = document.createElement("div");

        event.className =
            "event " + (index % 2 === 0 ? "top" : "bottom");

        event.style.left = position + "%";

        const stem = document.createElement("div");
        stem.className = "event-stem";

        const card = document.createElement("div");
        card.className = "event-card";

        const name = document.createElement("strong");
        name.textContent = topic.name;

        const year = document.createElement("span");
        year.textContent = `${topic.year}年`;

        // 時代名も自動表示
        const era = document.createElement("span");
        era.className = "event-era";
        era.textContent = getEraName(topic.year);

        card.append(name, year, era);

        if (index % 2 === 0) {
            event.append(card, stem);
        } else {
            event.append(stem, card);
        }

        // 年表上の出来事の位置を示す点
        const dot = document.createElement("div");
        dot.className = "event-dot";
        dot.style.left = position + "%";
        dot.style.backgroundColor = getEraColor(topic.year);

        eventArea.append(event, dot);
    });

    timeline.appendChild(eventArea);

    // 右側の一覧も更新
    drawTopicList();
}

// 右側の歴史トピック一覧を作成する
function drawTopicList() {
    topicList.replaceChildren();

    const sortedTopics = [...topics].sort(
        (a, b) => a.year - b.year
    );

    sortedTopics.forEach(topic => {
        const row = document.createElement("div");
        row.className = "topic-row";

        const info = document.createElement("div");
        info.className = "topic-info";

        const title = document.createElement("strong");
        title.textContent = `${topic.year}年　${topic.name}`;

        const era = document.createElement("div");
        era.className = "topic-era";
        era.textContent = getEraName(topic.year);

        info.append(title, era);

        const button = document.createElement("button");
        button.className = "delete-button";
        button.textContent = "削除";

        button.addEventListener("click", () => {
            topics = topics.filter(t => t.id !== topic.id);

            saveTopics();
            drawTimeline();

            message.textContent = "トピックを削除しました。";
        });

        row.append(info, button);
        topicList.appendChild(row);
    });
}

// データをブラウザーに保存する
function saveTopics() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(topics)
        );
    } catch (error) {
        message.textContent = "保存できませんでした。";
    }
}

// 新しい歴史トピックを追加する
function addTopic() {
    const name = topicInput.value.trim();
    const year = Number(yearInput.value);

    if (name === "") {
        message.textContent = "出来事の名前を入力してください。";
        topicInput.focus();
        return;
    }

    if (
        yearInput.value === "" ||
        !Number.isInteger(year) ||
        year < START_YEAR ||
        year > END_YEAR
    ) {
        message.textContent =
            "発生年は1〜2026年の整数で入力してください。";
        yearInput.focus();
        return;
    }

    topics.push({
        id: nextId++,
        name: name,
        year: year
    });

    saveTopics();
    drawTimeline();

    topicInput.value = "";
    yearInput.value = "";

    updateEraPreview();

    message.textContent =
        `${year}年「${name}」を登録しました。` +
        `（${getEraName(year)}）`;
}

// 年号を入力するたびに時代名を更新
yearInput.addEventListener("input", updateEraPreview);

// 追加ボタン
document.getElementById("addButton")
    .addEventListener("click", addTopic);

// Enterキーでも追加できる
topicInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        addTopic();
    }
});

yearInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        addTopic();
    }
});

// 初期データに戻す
document.getElementById("resetButton")
    .addEventListener("click", () => {
        if (!confirm("登録内容を初期データに戻しますか？")) {
            return;
        }

        topics = initialTopics.map(t => ({ ...t }));

        nextId = Math.max(
            ...topics.map(t => t.id
        )) + 1;

        saveTopics();
        drawTimeline();

        message.textContent = "初期データに戻しました。";
    });

// 最初の画面を表示する
updateEraPreview();
drawTimeline();
