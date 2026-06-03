import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
    WiDaySunny,
    WiCloudy,
    WiRain,
    WiStrongWind,
    WiSunrise,
    WiSunset,
    WiThermometer,
    WiUmbrella,
    WiHorizonAlt,
    WiThermometerExterior,
} from "react-icons/wi";
import { IoLocationSharp, IoCalendarOutline } from "react-icons/io5";

// ============================================
// 型定義
// ============================================
interface OpenMeteoResponse {
    daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        sunrise: string[];
        sunset: string[];
        uv_index_max: number[];
        precipitation_probability_max: number[];
        wind_speed_10m_max: number[];
    };
    hourly: {
        visibility: number[];
        wind_speed_10m: number[];
    };
}

interface TomorrowSummary {
    date: string;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
    precipProb: number;
    windAvg: number;
    uvMax: number;
    sunrise: string;
    sunset: string;
    visibilityAvg: number;
}

interface DailyForecast {
    date: string;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
    precipProb: number;
}

// ============================================
// 七十二候 判定関数
// ============================================
const get72Kou = (date: Date): string => {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const md = m * 100 + d;

    if (md <= 208) return "立春：東風解凍（はるかぜこおりをとく）";
    if (md <= 213) return "立春：黄鶯睍睆（うぐいすなく）";
    if (md <= 218) return "立春：魚上氷（うおこおりをいずる）";
    if (md <= 223) return "雨水：土脉潤起（つちのしょううるおいおこる）";
    if (md <= 228) return "雨水：霞始靆（かすみはじめてたなびく）";
    if (md <= 304) return "雨水：草木萌動（そうもくめばえいずる）";
    if (md <= 309) return "啓蟄：蟄虫啓戸（すごもりむしとをひらく）";
    if (md <= 314) return "啓蟄：桃始笑（ももはじめてわらう）";
    if (md <= 319) return "啓蟄：菜虫化蝶（なむしちょうとなる）";
    if (md <= 324) return "春分：雀始巣（すずめはじめてすくう）";
    if (md <= 330) return "春分：桜始開（さくらはじめてひらく）";
    if (md <= 404) return "春分：雷乃発声（かみなりすなわちこえをはっす）";
    if (md <= 409) return "清明：玄鳥至（つばめきたる）";
    if (md <= 414) return "清明：鴻雁北（こうがんきたへかえる）";
    if (md <= 419) return "清明：虹始見（にじはじめてあらわる）";
    if (md <= 424) return "穀雨：葭始生（あしはじめてしょうず）";
    if (md <= 429) return "穀雨：霜止出苗（しもやんでなえいづる）";
    if (md <= 504) return "穀雨：牡丹華（ぼたんはなさく）";
    if (md <= 509) return "立夏：蛙始鳴（かわずはじめてなく）";
    if (md <= 514) return "立夏：蚯蚓出（みみずいづる）";
    if (md <= 520) return "立夏：竹笋生（たけのこしょうず）";
    if (md <= 525) return "小満：蚕起食桑（かいこおきてくわをはむ）";
    if (md <= 530) return "小満：紅花栄（べにばなさく）";
    if (md <= 605) return "小満：麦秋至（むぎのときいたる）";
    if (md <= 610) return "芒種：蟷螂生（かまきりしょうず）";
    if (md <= 615) return "芒種：腐草為螢（くされたるくさほたるとなる）";
    if (md <= 620) return "芒種：梅子黄（うめのみきばむ）";
    if (md <= 625) return "夏至：乃東枯（なつかれくさかるる）";
    if (md <= 630) return "夏至：菖蒲華（あやめはなさく）";
    if (md <= 706) return "夏至：半夏生（はんげしょうず）";
    if (md <= 711) return "小暑：温風至（あつかぜいたる）";
    if (md <= 716) return "小暑：蓮始開（はすはじめてひらく）";
    if (md <= 722) return "小暑：鷹乃学習（たかすなわちがくしゅうす）";
    if (md <= 727) return "大暑：桐始結花（きりはじめてはなをむすぶ）";
    if (md <= 801) return "大暑：土潤溽暑（つちうるおうてむしあつし）";
    if (md <= 806) return "大暑：大雨時行（たいうときどきにふる）";
    if (md <= 812) return "立秋：涼風至（すずかぜいたる）";
    if (md <= 817) return "立秋：寒蝉鳴（ひぐらしなく）";
    if (md <= 822) return "立秋：蒙霧升降（ふかききりまとう）";
    if (md <= 827) return "処暑：綿柎開（わたのはなしべひらく）";
    if (md <= 902) return "処暑：天地始粛（てんちはじめてさむし）";
    if (md <= 907) return "処暑：禾乃登（こくものすなわちみのる）";
    if (md <= 912) return "白露：草露白（くさのつゆしろし）";
    if (md <= 917) return "白露：鶺鴒鳴（せきれいなく）";
    if (md <= 922) return "白露：玄鳥去（つばめさる）";
    if (md <= 927) return "秋分：雷乃収声（かみなりすなわちこえをおさむ）";
    if (md <= 1002) return "秋分：蟄虫坏戸（むしかくれてとをふさぐ）";
    if (md <= 1007) return "秋分：水始涸（みずはじめてかる）";
    if (md <= 1012) return "寒露：鴻雁来（こうがんきたる）";
    if (md <= 1017) return "寒露：菊花開（きくのはなひらく）";
    if (md <= 1022) return "寒露：開（きくのはなひらく）";
    if (md <= 1027) return "霜降：霜始降（しもはじめてふる）";
    if (md <= 1101) return "霜降：霎時施（こさめときどきふる）";
    if (md <= 1106) return "霜降：楓蔦黄（もみじつたきばむ）";
    if (md <= 1111) return "立冬：山茶始開(つばきはじめてひらく)";
    if (md <= 1116) return "立冬：地始凍（ちはじめてこおる）";
    if (md <= 1121) return "立冬：金盞香（きんせんかさく）";
    if (md <= 1126) return "小雪：虹蔵不見（にじかくれてみえず）";
    if (md <= 1201) return "小雪：朔風払葉（きたかぜこのはをはらう）";
    if (md <= 1206) return "小雪：橘始黄（たちばなはじめてきばむ）";
    if (md <= 1211) return "大雪：閉塞成冬(そらさむくふゆとなる)";
    if (md <= 1216) return "大雪：熊蟄穴（くまあなにこもる）";
    if (md <= 1220) return "大雪：鱖魚群（さけのうおむらがる）";
    if (md <= 1225) return "冬至：乃東生（なつかれくさしょうず）";
    if (md <= 1230) return "冬至：麋角解（おおしかのつのおつる）";
    if (md <= 104) return "冬至：雪下出麦（ゆきわたりてむぎいづる）";
    if (md <= 109) return "小寒：芹乃栄（せりすなわちさかう）";
    if (md <= 114) return "小寒：水泉動（しみずあたたかをふくむ）";
    if (md <= 119) return "小寒：雉始雊（きじはじめてなく）";
    if (md <= 124) return "大寒：款冬華（ふきのはなはなさく）";
    if (md <= 129) return "大寒：水沢腹堅（さわみずこおりつめる）";
    return "大寒：鶏始乳（にわとりはじめてとやにつく）";
};

// ============================================
// ユーティリティー
// ============================================
const getWeatherInfo = (code: number): { text: string; icon: ReactNode } => {
    if (code === 0)
        return {
            text: "ぴかぴか快晴",
            icon: <WiDaySunny style={{ color: "#ff9f43" }} />,
        };
    if (code <= 3)
        return {
            text: "晴れ / 曇り",
            icon: <WiCloudy style={{ color: "#54a0ff" }} />,
        };
    if (code >= 61 && code <= 65)
        return {
            text: "雨",
            icon: <WiRain style={{ color: "#5ea3ff" }} />,
        };
    return {
        text: "お空のご機嫌斜め",
        icon: <WiCloudy style={{ color: "#8395a7" }} />,
    };
};

const formatDate = (dateString: string): string => {
    const d = new Date(dateString);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const getDayOfWeek = (dateString: string): string => {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const d = new Date(dateString);
    return days[d.getDay()];
};

// ============================================
// サブコンポーネント
// ============================================
const DataCard = ({
    icon,
    label,
    value,
    badgeColor,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    badgeColor?: string;
}) => (
    <div style={styles.card}>
        <div style={styles.cardTitleLine}>
            <span
                style={{
                    ...styles.cardIconBadge,
                    backgroundColor: badgeColor || "#f0f3f6",
                }}
            >
                {icon}
            </span>
            <span style={styles.cardLabel}>{label}</span>
        </div>
        <p style={styles.cardValue}>{value}</p>
    </div>
);

// ============================================
// メインコンポーネント
// ============================================
export default function App() {
    const [summary, setSummary] = useState<TomorrowSummary | null>(null);
    const [weeklyList, setWeeklyList] = useState<DailyForecast[]>([]);

    const [errorMsg, setErrorMsg] = useState<string | null>(() => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            return "GPSがつかえませんでした 😢";
        }
        return null;
    });

    useEffect(() => {
        if (errorMsg) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max&hourly=visibility,wind_speed_10m&timezone=Asia%2FTokyo&forecast_days=7`;

                fetch(url)
                    .then((res) => res.json())
                    .then((data: OpenMeteoResponse) => {
                        const tomorrowWinds = data.hourly.wind_speed_10m.slice(
                            24,
                            48,
                        );
                        const avgWind =
                            tomorrowWinds.reduce((a, b) => a + b, 0) / 24;

                        setSummary({
                            date: data.daily.time[1],
                            weatherCode: data.daily.weather_code[1],
                            tempMax: data.daily.temperature_2m_max[1],
                            tempMin: data.daily.temperature_2m_min[1],
                            precipProb:
                                data.daily.precipitation_probability_max[1],
                            windAvg: avgWind,
                            uvMax: data.daily.uv_index_max[1],
                            sunrise: data.daily.sunrise[1].split("T")[1],
                            sunset: data.daily.sunset[1].split("T")[1],
                            visibilityAvg:
                                data.hourly.visibility
                                    .slice(24, 48)
                                    .reduce((a, b) => a + b, 0) /
                                24 /
                                1000,
                        });

                        const forecasts: DailyForecast[] = data.daily.time.map(
                            (timeStr, idx) => ({
                                date: timeStr,
                                weatherCode: data.daily.weather_code[idx],
                                tempMax: data.daily.temperature_2m_max[idx],
                                tempMin: data.daily.temperature_2m_min[idx],
                                precipProb:
                                    data.daily.precipitation_probability_max[
                                        idx
                                    ],
                            }),
                        );
                        setWeeklyList(forecasts);
                    })
                    .catch(() =>
                        setErrorMsg("お天気データの取得に失敗しちゃいました"),
                    );
            },
            () => setErrorMsg("位置情報の許可をお願いします 🙏"),
        );
    }, [errorMsg]);

    if (errorMsg) {
        return (
            <div style={styles.loaderContainer}>
                <div style={styles.errorBox}>{errorMsg}</div>
            </div>
        );
    }

    if (!summary) {
        return (
            <div style={styles.loaderContainer}>
                <div style={styles.loadingBox}>
                    🧭 探検の準備中（GPS測位中）...
                </div>
            </div>
        );
    }

    const isGoodCondition = summary.windAvg < 5 && summary.precipProb < 30;
    const weather = getWeatherInfo(summary.weatherCode);
    const kouText = get72Kou(new Date(summary.date));

    return (
        <div style={styles.container}>
            <div style={styles.contentWrapper}>
                <header style={styles.header}>
                    <div style={styles.locationLine}>
                        <IoLocationSharp style={{ color: "#10ac84" }} />
                        <span>いまココ付近の予報</span>
                    </div>
                    <div style={styles.titleLine}>
                        <h1 style={styles.title}>
                            <IoCalendarOutline style={{ color: "#10ac84" }} />
                            {formatDate(summary.date)} のそら
                        </h1>
                        <span style={styles.seasonText}>🌱 {kouText}</span>
                    </div>
                </header>

                <div
                    style={{
                        ...styles.judgeCard,
                        backgroundColor: isGoodCondition
                            ? "#ebfbee"
                            : "#fff5f5",
                        borderColor: isGoodCondition ? "#10ac84" : "#ff6b6b",
                    }}
                >
                    <span
                        style={{
                            ...styles.judgeStatus,
                            backgroundColor: isGoodCondition
                                ? "#10ac84"
                                : "#ff6b6b",
                        }}
                    >
                        {isGoodCondition ? "Let's Go! 🦜" : "Caution ☔"}
                    </span>
                    <p
                        style={{
                            ...styles.judgeText,
                            color: isGoodCondition ? "#0f7654" : "#c92a2a",
                        }}
                    >
                        {/*{isGoodCondition
                            ? "野鳥かんさつ日和！"
                            : "少し注意が必要"}*/}
                    </p>
                    <div style={styles.weatherLarge}>
                        <span style={styles.largeIconWrapper}>
                            {weather.icon}
                        </span>
                        <span style={{ fontWeight: "800", color: "#2c3e50" }}>
                            {weather.text}
                        </span>
                    </div>
                </div>

                <div style={styles.grid}>
                    <DataCard
                        icon={
                            <WiThermometer
                                style={{ fontSize: "1.6rem", color: "#ff6b6b" }}
                            />
                        }
                        label="最高気温"
                        value={`${summary.tempMax}°C`}
                        badgeColor="#ffe3e3"
                    />
                    <DataCard
                        icon={
                            <WiThermometerExterior
                                style={{ fontSize: "1.6rem", color: "#228be6" }}
                            />
                        }
                        label="最低気温"
                        value={`${summary.tempMin}°C`}
                        badgeColor="#e7f5ff"
                    />
                    <DataCard
                        icon={
                            <WiUmbrella
                                style={{ fontSize: "1.6rem", color: "#4c6ef5" }}
                            />
                        }
                        label="降水確率"
                        value={`${summary.precipProb}%`}
                        badgeColor="#edf2ff"
                    />
                    <DataCard
                        icon={
                            <WiStrongWind
                                style={{ fontSize: "1.6rem", color: "#0b7285" }}
                            />
                        }
                        label="平均風速"
                        value={`${summary.windAvg.toFixed(1)}m/s`}
                        badgeColor="#e3fafc"
                    />
                    <DataCard
                        icon={
                            <WiSunrise
                                style={{ fontSize: "1.6rem", color: "#f59f00" }}
                            />
                        }
                        label="日の出"
                        value={summary.sunrise}
                        badgeColor="#fff9db"
                    />
                    <DataCard
                        icon={
                            <WiSunset
                                style={{ fontSize: "1.6rem", color: "#e8590c" }}
                            />
                        }
                        label="日の入り"
                        value={summary.sunset}
                        badgeColor="#fff4e6"
                    />
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                        marginTop: "16px",
                    }}
                >
                    <DataCard
                        icon={
                            <WiDaySunny
                                style={{ fontSize: "1.6rem", color: "#cc5de8" }}
                            />
                        }
                        label="最大紫外線"
                        value={`${summary.uvMax}`}
                        badgeColor="#f8f0fc"
                    />
                    <DataCard
                        icon={
                            <WiHorizonAlt
                                style={{ fontSize: "1.6rem", color: "#37b24d" }}
                            />
                        }
                        label="見わたせる距離"
                        value={`${summary.visibilityAvg.toFixed(1)}km`}
                        badgeColor="#ebfbee"
                    />
                </div>

                <section style={styles.weeklySection}>
                    <h2 style={styles.weeklyTitle}>🗓️ 一週間の予報</h2>
                    <div style={styles.weeklyList}>
                        {weeklyList.map((day, idx) => {
                            const dayWeather = getWeatherInfo(day.weatherCode);
                            const isToday = idx === 0;
                            const isTomorrow = idx === 1;
                            let dateLabel = formatDate(day.date);
                            if (isToday) dateLabel = "きょう";
                            if (isTomorrow) dateLabel = "あした";

                            // 最後の行だけ下線を引かないように調整
                            const isLast = idx === weeklyList.length - 1;
                            const rowStyle = {
                                ...styles.weeklyRow,
                                borderBottom: isLast
                                    ? "none"
                                    : styles.weeklyRow.borderBottom,
                            };

                            return (
                                <div key={day.date} style={rowStyle}>
                                    <div style={styles.weeklyDateBlock}>
                                        <span style={styles.weeklyDateText}>
                                            {dateLabel}
                                        </span>
                                        {!isToday && !isTomorrow && (
                                            <span
                                                style={styles.weeklyDayOfWeek}
                                            >
                                                ({getDayOfWeek(day.date)})
                                            </span>
                                        )}
                                    </div>
                                    <div style={styles.weeklyIconBlock}>
                                        {dayWeather.icon}
                                    </div>
                                    <div style={styles.weeklyPrecipBlock}>
                                        <span
                                            style={{
                                                color: "#7f8c8d",
                                                fontSize: "0.75rem",
                                            }}
                                        >
                                            ☔
                                        </span>
                                        <span style={styles.weeklyPrecipText}>
                                            {day.precipProb}%
                                        </span>
                                    </div>
                                    <div style={styles.weeklyTempBlock}>
                                        <span style={styles.weeklyTempMax}>
                                            {Math.round(day.tempMax)}°
                                        </span>
                                        /
                                        <span style={styles.weeklyTempMin}>
                                            {Math.round(day.tempMin)}°
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <footer style={styles.footer}>
                    <p>🪶 BirdWeather v1.3</p>
                </footer>
            </div>
        </div>
    );
}

// ============================================
// スタイル定義
// ============================================
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: "24px 16px",
        backgroundColor: "#f9f6f0",
        color: "#2c3e50",
        fontFamily: "sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    loaderContainer: {
        backgroundColor: "#f9f6f0",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingBox: {
        padding: "20px 30px",
        backgroundColor: "#fff",
        borderRadius: "16px",
        border: "3px solid #2c3e50",
        boxShadow: "4px 4px 0px #2c3e50",
        fontWeight: "bold",
    },
    errorBox: {
        padding: "20px 30px",
        backgroundColor: "#fff5f5",
        borderRadius: "16px",
        border: "3px solid #ff6b6b",
        fontWeight: "bold",
        color: "#f03e3e",
    },
    contentWrapper: { width: "100%", maxWidth: "480px" },
    header: { marginBottom: "24px" },
    locationLine: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.85rem",
        color: "#7f8c8d",
    },
    titleLine: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        marginTop: "8px",
    },
    title: {
        fontSize: "1.8rem",
        fontWeight: "900",
        margin: 0,
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    seasonText: {
        fontSize: "0.9rem",
        color: "#10ac84",
        fontWeight: "700",
        backgroundColor: "#e3faf2",
        padding: "6px 12px",
        borderRadius: "20px",
        alignSelf: "flex-start",
    },
    judgeCard: {
        padding: "24px",
        marginBottom: "24px",
        borderRadius: "20px",
        border: "3px solid #2c3e50",
        boxShadow: "5px 5px 0px #2c3e50",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    judgeStatus: {
        fontSize: "0.75rem",
        fontWeight: "900",
        color: "#fff",
        padding: "4px 14px",
        borderRadius: "12px",
    },
    judgeText: {
        fontSize: "1.6rem",
        fontWeight: "900",
        margin: "12px 0 6px 0",
        textAlign: "center",
    },
    weatherLarge: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "2rem",
    },
    largeIconWrapper: {
        fontSize: "3.5rem",
        display: "flex",
        alignItems: "center",
    },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
    card: {
        backgroundColor: "#fff",
        padding: "16px",
        border: "3px solid #2c3e50",
        borderRadius: "16px",
        boxShadow: "3px 3px 0px #2c3e50",
    },
    cardTitleLine: { display: "flex", alignItems: "center", gap: "8px" },
    cardIconBadge: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "10px",
        border: "2px solid #2c3e50",
    },
    cardLabel: { color: "#7f8c8d", fontSize: "0.85rem" },
    cardValue: { fontSize: "1.6rem", fontWeight: "900", margin: "12px 0 0 0" },
    weeklySection: { marginTop: "32px" },
    weeklyTitle: {
        fontSize: "1.2rem",
        fontWeight: "900",
        marginBottom: "16px",
    },
    weeklyList: {
        backgroundColor: "#fff",
        border: "3px solid #2c3e50",
        borderRadius: "20px",
        padding: "12px 16px",
    },
    // 🛠️ 【修正箇所】縦のズレを無くし、均等配置にするためのスタイル定義
    weeklyRow: {
        display: "grid",
        // 日付・アイコン・降水確率・気温の各ブロック幅を明示的に固定、または最小・最大幅を定義
        gridTemplateColumns: "110px 70px 100px 1fr",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px dashed #e2e8f0",
    },
    weeklyDateBlock: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        justifyContent: "flex-start",
    },
    weeklyDateText: { fontWeight: "700", fontSize: "0.95rem" },
    weeklyDayOfWeek: { fontSize: "0.8rem", color: "#7f8c8d" },
    weeklyIconBlock: {
        display: "flex",
        justifyContent: "center", // アイコンを列の中央に
        alignItems: "center",
        fontSize: "1.8rem",
    },
    weeklyPrecipBlock: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end", // 降水確率は右寄せにして数値の桁ズレに対応
        gap: "4px",
        paddingRight: "8px",
    },
    weeklyPrecipText: {
        fontSize: "0.9rem",
        fontWeight: "700",
        color: "#4c6ef5",
        width: "35px", // 2桁+「%」がブレない幅
        textAlign: "right",
    },
    weeklyTempBlock: {
        display: "flex",
        justifyContent: "flex-end", // 気温は一番右側に寄せる
        gap: "12px",
        fontWeight: "800",
    },
    weeklyTempMax: { color: "#ff6b6b", width: "30px", textAlign: "right" },
    weeklyTempMin: { color: "#228be6", width: "30px", textAlign: "right" },
    footer: {
        marginTop: "40px",
        textAlign: "center",
        fontSize: "0.8rem",
        color: "#95a5a6",
    },
};
