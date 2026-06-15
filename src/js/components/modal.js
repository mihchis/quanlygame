// Component: Game Details Modal Manager (fetching, displaying expanded info, ratings chart, similar games, and status editing)

import { state, SUB_STATUS_OPTIONS, saveGames } from '../state.js';
import { showConfirm, showAlert } from './dialog.js';
import { updateLibraryStats, renderDashboard } from './dashboard.js';
import { renderListTab } from './library.js';
import { renderSpecsComparison } from './dxdiag.js';
import { switchTab } from '../app.js';
import { renderDiscoverResults, browseByTag, browseByGenre } from './discover.js';
import { renderRawgSearchResults } from './search.js';

// DOM elements for modal
const gameDetailModal = document.getElementById('game-detail-modal');
const modalContainer = document.querySelector('.modal-container');
const btnCloseModal = document.getElementById('btn-close-modal');
const modalCoverImg = document.getElementById('modal-cover-img');
const modalMetaScore = document.getElementById('modal-meta-score');
const modalScreenshotsContainer = document.getElementById('modal-screenshots-container');
const modalTitle = document.getElementById('modal-title');
const modalReleaseDev = document.getElementById('modal-release-dev');
const modalDescription = document.getElementById('modal-description');
const selectGameStatus = document.getElementById('select-game-status');
const btnSaveModal = document.getElementById('btn-save-modal');
const btnDeleteModal = document.getElementById('btn-delete-modal');
const rowSubstatusPlatform = document.getElementById('row-substatus-platform');
const selectGameSubstatus = document.getElementById('select-game-substatus');
const selectGamePlatform = document.getElementById('select-game-platform');

const modalGenres = document.getElementById('modal-genres');
const modalPlatforms = document.getElementById('modal-platforms');
const modalPublishers = document.getElementById('modal-publishers');
const modalEsrb = document.getElementById('modal-esrb');
const modalPlaytime = document.getElementById('modal-playtime');
const modalWebsite = document.getElementById('modal-website');
const modalTagsContainer = document.getElementById('modal-tags-container');
const modalSimilarContainer = document.getElementById('modal-similar-container');
const modalAdditionsSection = document.getElementById('modal-additions-section');
const modalAdditionsContainer = document.getElementById('modal-additions-container');
const modalTeamSection = document.getElementById('modal-team-section');
const modalTeamContainer = document.getElementById('modal-team-container');
const modalSeriesSection = document.getElementById('modal-series-section');
const modalSeriesContainer = document.getElementById('modal-series-container');
const modalParentsSection = document.getElementById('modal-parents-section');
const modalParentsContainer = document.getElementById('modal-parents-container');

// New media and achievements DOM references
const modalTrailersSection = document.getElementById('modal-trailers-section');
const modalTrailerVideo = document.getElementById('modal-trailer-video');
const modalAchievementsListSection = document.getElementById('modal-achievements-list-section');
const modalAchievementsContainer = document.getElementById('modal-achievements-container');
const modalRedditPostsSection = document.getElementById('modal-reddit-posts-section');
const modalRedditPostsContainer = document.getElementById('modal-reddit-posts-container');
const modalTwitchSection = document.getElementById('modal-twitch-section');
const modalTwitchContainer = document.getElementById('modal-twitch-container');
const modalYoutubeSection = document.getElementById('modal-youtube-section');
const modalYoutubeContainer = document.getElementById('modal-youtube-container');

// Extended metadata DOM references
const modalMetacriticDetail = document.getElementById('modal-metacritic-detail');
const modalAltNames = document.getElementById('modal-alt-names');
const modalAchievements = document.getElementById('modal-achievements');
const modalAddedCount = document.getElementById('modal-added-count');
const modalReddit = document.getElementById('modal-reddit');
const modalStudioHq = document.getElementById('modal-studio-hq');
const modalStudioEst = document.getElementById('modal-studio-est');
const modalRatingsChartSection = document.getElementById('modal-ratings-chart-section');
const modalRatingsChart = document.getElementById('modal-ratings-chart');
const modalRatingsLegend = document.getElementById('modal-ratings-legend');

// Status specific divs & fields
const fieldsPlaying = document.getElementById('fields-playing');
const fieldsBacklog = document.getElementById('fields-backlog');
const fieldsCompleted = document.getElementById('fields-completed');

const inputPlayingHours = document.getElementById('input-playing-hours');
const inputPlayingStart = document.getElementById('input-playing-start');
const inputPlayingNotes = document.getElementById('input-playing-notes');
const selectBacklogPriority = document.getElementById('select-backlog-priority');
const inputCompletedDate = document.getElementById('input-completed-date');
const inputCompletedReview = document.getElementById('input-completed-review');
const starBtns = document.querySelectorAll('#completed-rating-stars .star-btn');

// Esports DOM references
const modalEsportsSection = document.getElementById('modal-esports-section');
const esportsTabBtns = document.querySelectorAll('.esports-tab-btn');
const esportsTabPanes = document.querySelectorAll('.esports-tab-pane');
const esportsContentLeagues = document.getElementById('esports-content-leagues');
const esportsContentTeams = document.getElementById('esports-content-teams');
const esportsContentPlayers = document.getElementById('esports-content-players');
const esportsContentMatches = document.getElementById('esports-content-matches');

// Journal DOM references
const modalJournalSection = document.getElementById('modal-journal-section');
const btnToggleJournalForm = document.getElementById('btn-toggle-journal-form');
const journalAddForm = document.getElementById('journal-add-form');
const inputSessionDate = document.getElementById('input-session-date');
const inputSessionHours = document.getElementById('input-session-hours');
const inputSessionNotes = document.getElementById('input-session-notes');
const btnCancelSession = document.getElementById('btn-cancel-session');
const btnSaveSession = document.getElementById('btn-save-session');
const journalSessionsList = document.getElementById('journal-sessions-list');

// Static Esports Database for major competitive games
const ESPORTS_DB = {
  lol: {
    name: "League of Legends",
    leagues: [
      { name: "Worlds (Chung Kết Thế Giới)", desc: "Giải đấu vô địch thế giới hàng năm lớn nhất của Liên Minh Huyền Thoại.", region: "Quốc tế" },
      { name: "LCK (League of Legends Champions Korea)", desc: "Giải vô địch Liên Minh Huyền Thoại chuyên nghiệp cấp cao nhất của Hàn Quốc.", region: "Hàn Quốc" },
      { name: "VCS (Vietnam Championship Series)", desc: "Giải vô địch Liên Minh Huyền Thoại chuyên nghiệp cấp cao nhất của Việt Nam.", region: "Việt Nam" },
      { name: "LPL (League of Legends Pro League)", desc: "Giải vô địch Liên Minh Huyền Thoại chuyên nghiệp cấp cao nhất của Trung Quốc.", region: "Trung Quốc" }
    ],
    teams: [
      { name: "T1", desc: "Đội tuyển giàu thành tích nhất lịch sử với 5 chức vô địch thế giới.", country: "Hàn Quốc", captain: "Faker" },
      { name: "Gen.G Esports", desc: "Đội tuyển thống trị LCK quốc nội với lối chơi kiểm soát cực mạnh.", country: "Hàn Quốc", captain: "Chovy" },
      { name: "GAM Esports", desc: "Cựu vương và là cánh chim đầu đàn của khu vực VCS Việt Nam.", country: "Việt Nam", captain: "Levi" },
      { name: "Weibo Gaming", desc: "Á quân thế giới 2023, quy tụ nhiều tuyển thủ danh tiếng.", country: "Trung Quốc", captain: "Xiaohu" }
    ],
    players: [
      { name: "Faker (Lee Sang-hyeok)", role: "Mid Laner (Đường giữa)", team: "T1", ach: "5x Vô địch thế giới", age: 29, country: "Hàn Quốc" },
      { name: "Chovy (Jeong Ji-hoon)", role: "Mid Laner (Đường giữa)", team: "Gen.G Esports", ach: "Nhiều lần vô địch LCK", age: 25, country: "Hàn Quốc" },
      { name: "Levi (Đỗ Duy Khánh)", role: "Jungler (Đi rừng)", team: "GAM Esports", ach: "Thống trị VCS Việt Nam", age: 28, country: "Việt Nam" },
      { name: "Kiin (Kim Gi-in)", role: "Top Laner (Đường trên)", team: "Gen.G Esports", ach: "Top laner hàng đầu LCK", age: 26, country: "Hàn Quốc" }
    ],
    matches: [
      { team1: "T1", score1: 3, team2: "Gen.G Esports", score2: 2, date: "14/04/2026", tournament: "LCK Mùa Xuân - Chung kết" },
      { team1: "GAM Esports", score1: 2, team2: "Weibo Gaming", score2: 1, date: "22/10/2025", tournament: "Worlds - Vòng bảng" }
    ]
  },
  valorant: {
    name: "Valorant",
    leagues: [
      { name: "VCT Champions", desc: "Giải đấu đỉnh cao quy mô toàn cầu xác định nhà vô địch thế giới Valorant.", region: "Quốc tế" },
      { name: "VCT Pacific", desc: "Giải đấu cấp châu Á - Thái Bình Dương.", region: "Châu Á - Thái Bình Dương" },
      { name: "VCT Americas", desc: "Giải đấu chuyên nghiệp khu vực Bắc Mỹ và Nam Mỹ.", region: "Châu Mỹ" },
      { name: "VCT EMEA", desc: "Giải đấu chuyên nghiệp khu vực Châu Âu, Trung Đông và Châu Phi.", region: "Châu Âu" }
    ],
    teams: [
      { name: "Sentinels", desc: "Đội tuyển Valorant nổi tiếng bậc nhất Bắc Mỹ với lượng fan đông đảo.", country: "Hoa Kỳ", captain: "Johnqt" },
      { name: "Paper Rex", desc: "Đội tuyển Đông Nam Á nổi tiếng với lối chơi tấn công rực lửa, cống hiến.", country: "Singapore", captain: "d3ffo" },
      { name: "Fnatic", desc: "Gã khổng lồ của Valorant Châu Âu với tư duy chiến thuật đỉnh cao.", country: "Vương Quốc Anh", captain: "Boaster" },
      { name: "Gen.G Esports VALORANT", desc: "Đội tuyển xuất sắc bậc nhất khu vực Pacific Hàn Quốc.", country: "Hàn Quốc", captain: "Munchkin" }
    ],
    players: [
      { name: "TenZ (Tyson Ngo)", role: "Flex / Duelist", team: "Sentinels", ach: "Vô địch Masters Reykjavik & Madrid", age: 24, country: "Canada" },
      { name: "f0rsakeN (Jason Susanto)", role: "Flex (Đa dụng)", team: "Paper Rex", ach: "Á quân Champions 2023", age: 22, country: "Indonesia" },
      { name: "Chronicle (Timofey Khromov)", role: "Initiator (Khởi đầu)", team: "Fnatic", ach: "Vô địch 3 giải quốc tế", age: 23, country: "Nga" },
      { name: "t3xture (Kim Na-ra)", role: "Duelist (Đối đầu)", team: "Gen.G Esports", ach: "Vô địch VCT Pacific", age: 24, country: "Hàn Quốc" }
    ],
    matches: [
      { team1: "Sentinels", score1: 3, team2: "Gen.G Esports", score2: 2, date: "24/03/2026", tournament: "VCT Masters Madrid - Chung kết" },
      { team1: "Paper Rex", score1: 2, team2: "Fnatic", score2: 0, date: "15/08/2025", tournament: "VCT Champions - Tứ kết" }
    ]
  },
  cs: {
    name: "Counter-Strike 2",
    leagues: [
      { name: "PGL Major", desc: "Giải đấu cấp độ cao nhất do Valve tài trợ chính thức.", region: "Quốc tế" },
      { name: "IEM Katowice", desc: "Giải đấu truyền thống huyền thoại được tổ chức tại Ba Lan.", region: "Châu Âu" },
      { name: "ESL Pro League", desc: "Giải đấu league dài hạn danh giá nhất của làng Counter-Strike.", region: "Quốc tế" }
    ],
    teams: [
      { name: "Natus Vincere (NaVi)", desc: "Tổ chức esports huyền thoại của Ukraine, đương kim vô địch Major CS2 đầu tiên.", country: "Ukraine", captain: "Aleksib" },
      { name: "FaZe Clan", desc: "Đội hình siêu sao quốc tế giàu kinh nghiệm thi đấu và bản lĩnh.", country: "Châu Âu", captain: "karrigan" },
      { name: "Team Vitality", desc: "Đội tuyển CS Pháp-Đan Mạch với lối chơi chiến thuật sắc bén.", country: "Pháp", captain: "apEX" },
      { name: "G2 Esports CS", desc: "Đội tuyển quốc tế nổi tiếng với phong cách thi đấu bùng nổ.", country: "Châu Âu", captain: "Snax" }
    ],
    players: [
      { name: "ZywOo (Mathieu Herbaut)", role: "AWPer (Xạ thủ)", team: "Team Vitality", ach: "Nhiều lần đạt MVP thế giới", age: 25, country: "Pháp" },
      { name: "s1mple (Oleksandr Kostyliev)", role: "Rifler / AWPer", team: "Natus Vincere", ach: "Huyền thoại vĩ đại nhất lịch sử CS:GO", age: 28, country: "Ukraine" },
      { name: "m0NESY (Ilya Osipov)", role: "AWPer (Xạ thủ trẻ)", team: "G2 Esports", ach: "Thần đồng bắn tỉa xuất sắc", age: 20, country: "Nga" },
      { name: "karrigan (Finn Andersen)", role: "IGL (Chỉ huy)", team: "FaZe Clan", ach: "Đội trưởng lớn tuổi nhất vô địch Major", age: 36, country: "Đan Mạch" }
    ],
    matches: [
      { team1: "Natus Vincere", score1: 2, team2: "FaZe Clan", score2: 1, date: "31/03/2026", tournament: "PGL Major Copenhagen - Chung kết" },
      { team1: "G2 Esports", score1: 2, team2: "Team Vitality", score2: 0, date: "18/02/2026", tournament: "IEM Katowice - Bán kết" }
    ]
  },
  dota2: {
    name: "Dota 2",
    leagues: [
      { name: "The International", desc: "Giải vô địch thế giới thường niên với chiếc khiên Aegis danh giá.", region: "Quốc tế" },
      { name: "Riyadh Masters", desc: "Giải đấu Esports lớn thuộc chuỗi sự kiện Gamers8 với tiền thưởng siêu khủng.", region: "Ả Rập Xê Út" },
      { name: "DreamLeague", desc: "Giải đấu online dài hơi lâu đời và uy tín bậc nhất Dota 2.", region: "Châu Âu" }
    ],
    teams: [
      { name: "Team Spirit", desc: "Đội tuyển Nga-Ukraine sở hữu bản lĩnh thép và chức vô địch TI hai lần.", country: "Đông Âu", captain: "Miposhka" },
      { name: "Gaimin Gladiators", desc: "Đội tuyển thống trị các giải Major năm 2023 với lối chơi huỷ diệt.", country: "Châu Âu", captain: "Seleri" },
      { name: "Team Liquid DOTA", desc: "Gã khổng lồ châu Âu nổi tiếng với sự ổn định tuyệt đối.", country: "Thụy Điển", captain: "Insania" },
      { name: "Xtreme Gaming", desc: "Đội tuyển đại diện cho thế lực phục hưng Dota 2 Trung Quốc.", country: "Trung Quốc", captain: "Dy" }
    ],
    players: [
      { name: "Yatoro (Ilya Mulyarchuk)", role: "Carry (Chủ lực)", team: "Team Spirit", ach: "2x Vô địch TI, carry xuất sắc nhất", age: 23, country: "Ukraine" },
      { name: "Quinn (Quinn Callahan)", role: "Mid Laner (Đường giữa)", team: "Gaimin Gladiators", ach: "Vô địch DreamLeague & Major", age: 27, country: "Hoa Kỳ" },
      { name: "Nisha (Michał Jankowski)", role: "Mid Laner (Đường giữa)", team: "Team Liquid", ach: "Kỹ năng cá nhân đỉnh cao bậc nhất", age: 25, country: "Ba Lan" },
      { name: "Ame (Wang Chunyu)", role: "Carry (Chủ lực)", team: "Xtreme Gaming", ach: "Huyền thoại Carry Trung Quốc", age: 29, country: "Trung Quốc" }
    ],
    matches: [
      { team1: "Team Spirit", score1: 3, team2: "Gaimin Gladiators", score2: 0, date: "29/10/2025", tournament: "The International - Chung kết tổng" },
      { team1: "Team Liquid DOTA", score1: 2, team2: "Xtreme Gaming", score2: 1, date: "12/03/2026", tournament: "DreamLeague S22" }
    ]
  },
  fc: {
    name: "EA Sports FC / FIFA",
    leagues: [
      { name: "FC Pro Open", desc: "Giải đấu cấp câu lạc bộ toàn cầu chính thức của dòng game EA Sports FC.", region: "Toàn cầu" },
      { name: "FIFAe World Cup", desc: "Giải vô địch thế giới thường niên cấp đội tuyển quốc gia.", region: "Quốc tế" }
    ],
    teams: [
      { name: "Man City Esports", desc: "Đại diện thể thao điện tử chính thức của CLB Manchester City.", country: "Vương Quốc Anh", captain: "Tekkz" },
      { name: "PSG Esports", desc: "Câu lạc bộ thể thao điện tử hàng đầu nước Pháp.", country: "Pháp", captain: "phzin" },
      { name: "Guild Esports", desc: "Đội tuyển Anh được đồng sở hữu bởi David Beckham.", country: "Vương Quốc Anh", captain: "Nicolas99fc" }
    ],
    players: [
      { name: "Tekkz (Donovan Hunt)", role: "Tuyển thủ chủ lực", team: "Man City Esports", ach: "Nhiều danh hiệu vô địch quốc tế", age: 24, country: "Vương Quốc Anh" },
      { name: "phzin (Paulo Henrique)", role: "Chủ lực tấn công", team: "PSG Esports", ach: "Vô địch Nam Mỹ & FC Pro", age: 22, country: "Brazil" },
      { name: "Nicolas99fc (Nicolas Villalba)", role: "Bậc thầy kiểm soát", team: "Guild Esports", ach: "Á quân thế giới nhiều mùa", age: 26, country: "Argentina" }
    ],
    matches: [
      { team1: "Man City Esports", score1: 4, team2: "PSG Esports", score2: 3, date: "03/02/2026", tournament: "FC Pro Open Finals" },
      { team1: "Guild Esports", score1: 2, team2: "PSG Esports", score2: 1, date: "12/11/2025", tournament: "eWorld Cup Play-offs" }
    ]
  },
  sf6: {
    name: "Street Fighter 6",
    leagues: [
      { name: "Capcom Cup X", desc: "Giải đấu thế giới chính thức cao quý nhất do Capcom tổ chức.", region: "Quốc tế" },
      { name: "EVO Championship Series", desc: "Đại hội Fighting Games lớn nhất hành tinh tổ chức thường niên tại Mỹ.", region: "Toàn cầu" }
    ],
    teams: [
      { name: "Team Razer", desc: "Tổ chức thiết bị gaming quy tụ nhiều đấu sĩ tài năng hàng đầu.", country: "Singapore", captain: "Chris Wong" },
      { name: "Red Bull Gaming", desc: "Thế lực tài trợ hàng đầu của các nhà vô địch đối kháng.", country: "Hoa Kỳ", captain: "AngryBird" },
      { name: "FURS Esports", desc: "Đại diện ưu tú tập hợp các tuyển thủ đối kháng Đông Á.", country: "Hàn Quốc", captain: "Uma" }
    ],
    players: [
      { name: "Uma", role: "Đấu sĩ chủ lực (Juri)", team: "FURS Esports", ach: "Nhà vô địch Capcom Cup X", age: 24, country: "Đài Loan" },
      { name: "Chris Wong", role: "Đấu sĩ kỹ thuật (Luke)", team: "Team Razer", ach: "Á quân Capcom Cup X & Vô địch CPT", age: 31, country: "Hồng Kông" },
      { name: "AngryBird (Amjad Al-Shalabi)", role: "Đấu sĩ tấn công (Ken)", team: "Red Bull Gaming", ach: "Vô địch EVO 2023", age: 28, country: "UAE" }
    ],
    matches: [
      { team1: "FURS Esports", score1: 3, team2: "Team Razer", score2: 2, date: "26/02/2026", tournament: "Capcom Cup X Grand Finals" },
      { team1: "Red Bull Gaming", score1: 3, team2: "Team Beast", score2: 1, date: "21/07/2025", tournament: "EVO Las Vegas Finals" }
    ]
  },
  tekken: {
    name: "Tekken 8",
    leagues: [
      { name: "Tekken World Tour Finals", desc: "Đấu trường khép lại một năm tranh tài quyết liệt của Tekken.", region: "Quốc tế" },
      { name: "EVO Japan", desc: "Sự kiện Esports đối kháng đẳng cấp tổ chức tại cái nôi trò chơi Nhật Bản.", region: "Nhật Bản" }
    ],
    teams: [
      { name: "ASH Esports", desc: "Đội tuyển của huyền thoại đối kháng Arslan Ash.", country: "Pakistan", captain: "Arslan Ash" },
      { name: "KDF (Kwangdong Freecs)", desc: "Studio Esports chuyên nghiệp đào tạo thần đồng đối kháng Hàn Quốc.", country: "Hàn Quốc", captain: "CBM" }
    ],
    players: [
      { name: "Arslan Ash (Arslan Siddique)", role: "Võ sĩ huyền thoại", team: "ASH Esports", ach: "4x Vô địch EVO Tekken", age: 30, country: "Pakistan" },
      { name: "Ulsan (Lim Soo-hoon)", role: "Đấu sĩ thế hệ mới", team: "KDF", ach: "Vô địch EVO Japan 2024", age: 25, country: "Hàn Quốc" },
      { name: "CBM (CherryBerryMango)", role: "Đấu sĩ kỹ thuật", team: "KDF", ach: "Vô địch Tekken World Tour Major", age: 28, country: "Hàn Quốc" }
    ],
    matches: [
      { team1: "ASH Esports", score1: 3, team2: "KDF", score2: 1, date: "18/01/2026", tournament: "Tekken World Tour Grand Finals" },
      { team1: "KDF", score1: 3, team2: "ASH Esports", score2: 2, date: "29/04/2025", tournament: "EVO Japan Finals" }
    ]
  }
};;

// Company headquarters and established years registry (based on IGDB schemas DLOCATION_TABLE and PUBLISHER)
const COMPANY_REGISTRY = {
  "Valve": { location: "Bellevue, Washington, USA", established: 1996 },
  "Riot Games": { location: "Los Angeles, California, USA", established: 2006 },
  "Rockstar Games": { location: "New York City, New York, USA", established: 1998 },
  "Rockstar North": { location: "Edinburgh, Scotland", established: 1987 },
  "CD Projekt Red": { location: "Warsaw, Poland", established: 2002 },
  "CD Projekt": { location: "Warsaw, Poland", established: 1994 },
  "FromSoftware": { location: "Tokyo, Japan", established: 1986 },
  "Ubisoft": { location: "Montreuil, France", established: 1986 },
  "Ubisoft Montreal": { location: "Montreal, Canada", established: 1997 },
  "Electronic Arts": { location: "Redwood City, California, USA", established: 1982 },
  "EA Sports": { location: "Redwood City, California, USA", established: 1991 },
  "Epic Games": { location: "Cary, North Carolina, USA", established: 1991 },
  "Square Enix": { location: "Tokyo, Japan", established: 1975 },
  "Capcom": { location: "Osaka, Japan", established: 1979 },
  "Sony Interactive Entertainment": { location: "San Mateo, California, USA", established: 1993 },
  "Nintendo": { location: "Kyoto, Japan", established: 1889 },
  "Bethesda Game Studios": { location: "Rockville, Maryland, USA", established: 2001 },
  "Bethesda Softworks": { location: "Rockville, Maryland, USA", established: 1986 },
  "Blizzard Entertainment": { location: "Irvine, California, USA", established: 1991 },
  "Activision": { location: "Santa Monica, California, USA", established: 1979 },
  "BioWare": { location: "Edmonton, Canada", established: 1995 },
  "Bungie": { location: "Bellevue, Washington, USA", established: 1991 },
  "Insomniac Games": { location: "Burbank, California, USA", established: 1994 },
  "Naughty Dog": { location: "Santa Monica, California, USA", established: 1984 },
  "Santa Monica Studio": { location: "Los Angeles, California, USA", established: 1999 },
  "Sega": { location: "Tokyo, Japan", established: 1960 },
  "Kojima Productions": { location: "Tokyo, Japan", established: 2005 },
  "Bandai Namco Entertainment": { location: "Tokyo, Japan", established: 1955 },
  "Respawn Entertainment": { location: "Sherman Oaks, California, USA", established: 2010 },
  "Guerrilla Games": { location: "Amsterdam, Netherlands", established: 2000 },
  "Playground Games": { location: "Leamington Spa, England", established: 2010 },
  "Larian Studios": { location: "Ghent, Belgium", established: 1996 },
  "Warner Bros. Games": { location: "Burbank, California, USA", established: 2004 },
  "Warner Bros. Interactive Entertainment": { location: "Burbank, California, USA", established: 2004 },
  "Take-Two Interactive": { location: "New York City, New York, USA", established: 1993 },
  "2K Games": { location: "Novato, California, USA", established: 2005 },
  "Xbox Game Studios": { location: "Redmond, Washington, USA", established: 2002 }
};

// Fuzzy company search to handle variations (e.g. "Valve Corporation" matches "Valve")
function lookupCompanyInfo(companyName) {
  if (!companyName) return null;
  const norm = companyName.toLowerCase().replace(/[\s\.\,\-\_]/g, '');
  for (const [key, val] of Object.entries(COMPANY_REGISTRY)) {
    const keyNorm = key.toLowerCase().replace(/[\s\.\,\-\_]/g, '');
    if (norm.includes(keyNorm) || keyNorm.includes(norm)) {
      return val;
    }
  }
  return null;
}

// Dynamic Esports Data Generator
function getEsportsData(gameName, genres = [], tags = []) {
  const normName = gameName.toLowerCase();
  
  // 1. Direct match for major esports games
  if (normName.includes('league of legends') || normName === 'lol') {
    return ESPORTS_DB.lol;
  }
  if (normName.includes('valorant')) {
    return ESPORTS_DB.valorant;
  }
  if (normName.includes('counter-strike') || normName.includes('cs:go') || normName.includes('cs2') || normName === 'cs') {
    return ESPORTS_DB.cs;
  }
  if (normName.includes('dota')) {
    return ESPORTS_DB.dota2;
  }
  if (normName.includes('fifa') || normName.includes('fc 24') || normName.includes('fc 25') || normName.includes('fc 26')) {
    return ESPORTS_DB.fc;
  }
  if (normName.includes('street fighter') || normName.includes('sf6')) {
    return ESPORTS_DB.sf6;
  }
  if (normName.includes('tekken')) {
    return ESPORTS_DB.tekken;
  }

  // 2. Check if the game is competitive
  const competitiveKeywords = [
    'fifa', 'fc 24', 'fc 25', 'fc 26', 'street fighter', 'tekken', 'mortal kombat', 
    'pubg', 'apex legends', 'overwatch', 'rocket league', 'starcraft', 
    'smash bros', 'hearthstone', 'rainbow six', 'call of duty', 'halo',
    'league', 'championship', 'tournament', 'esports', 'multiplayer'
  ];
  
  const isCompetitiveName = competitiveKeywords.some(kw => normName.includes(kw));
  const isCompetitiveGenre = genres.some(g => ['Sports', 'Fighting'].includes(g));
  const isCompetitiveTag = tags.some(t => ['Multiplayer', 'Competitive', 'Esports', 'Tactical', 'Arena Shooter', 'PvP'].includes(t));

  if (!isCompetitiveName && !isCompetitiveGenre && !isCompetitiveTag) {
    return null; // Non-competitive game
  }

  // 3. Dynamic Generator based on Game Type
  let gameType = 'general';
  if (genres.includes('Fighting') || normName.includes('street fighter') || normName.includes('tekken') || normName.includes('mortal kombat')) {
    gameType = 'fighting';
  } else if (genres.includes('Sports') || normName.includes('fifa') || normName.includes('fc 24') || normName.includes('fc 25') || normName.includes('rocket league')) {
    gameType = 'sports';
  } else if (normName.includes('starcraft') || normName.includes('age of empires') || normName.includes('dune')) {
    gameType = 'strategy';
  } else if (normName.includes('apex') || normName.includes('pubg') || normName.includes('fortnite')) {
    gameType = 'battle_royale';
  }

  const cleanGameName = gameName.replace(/®|™|©/g, '').trim();

  // Dynamic leagues
  let leagues = [];
  if (gameType === 'fighting') {
    leagues = [
      { name: `${cleanGameName} Capcom Cup / Grand Finals`, desc: `Giải vô địch thế giới đối kháng đỉnh cao cấp CLB dành cho ${cleanGameName}.`, region: "Quốc tế" },
      { name: `EVO Championship Series`, desc: `Giải đấu võ thuật đối kháng danh giá bậc nhất thế giới tổ chức thường niên tại Las Vegas.`, region: "Quốc tế" }
    ];
  } else if (gameType === 'sports') {
    leagues = [
      { name: `${cleanGameName} Pro Open`, desc: `Giải đấu quy mô lớn quy tụ các danh thủ thể thao điện tử ảo.`, region: "Toàn cầu" },
      { name: `Virtual World Cup`, desc: `Giải đấu cup thế giới thường niên mô phỏng bóng đá/thể thao chuyên nghiệp.`, region: "Quốc tế" }
    ];
  } else {
    leagues = [
      { name: `${cleanGameName} Pro League (GPL)`, desc: `Giải đấu vô địch quốc gia chuyên nghiệp cấp cao nhất.`, region: "Châu Á" },
      { name: `${cleanGameName} World Championship`, desc: `Giải đấu vô địch thế giới quy tụ các đội tuyển xuất sắc nhất toàn cầu.`, region: "Quốc tế" }
    ];
  }

  // Dynamic Teams
  let teams = [];
  if (gameType === 'fighting') {
    teams = [
      { name: "Team Razer", desc: "Tổ chức tài trợ cho nhiều đấu sĩ đối kháng xuất sắc toàn thế giới.", country: "Singapore", captain: "Xian" },
      { name: "Red Bull Gaming", desc: "Thế lực tài trợ hàng đầu cho các nhà vô địch fighting game.", country: "Hoa Kỳ", captain: "Bonchan" },
      { name: "Team Beast", desc: "Đội tuyển của huyền thoại Daigo Umehara.", country: "Nhật Bản", captain: "Daigo" },
      { name: "FURS Esports", desc: "Tập hợp các đấu sĩ trẻ tài năng triển vọng.", country: "Hàn Quốc", captain: "MenaRD" }
    ];
  } else if (gameType === 'sports') {
    teams = [
      { name: "Man City Esports", desc: "Phân nhánh thể thao điện tử chính thức của câu lạc bộ Manchester City.", country: "Vương Quốc Anh", captain: "Tekkz" },
      { name: "PSG Esports", desc: "Đội tuyển chuyên nghiệp giàu truyền thống có trụ sở tại Paris.", country: "Pháp", captain: "phzin" },
      { name: "Guild Esports", desc: "Tổ chức Esports nổi tiếng được đầu tư bởi David Beckham.", country: "Vương Quốc Anh", captain: "Nicolas99fc" },
      { name: "Team Liquid Sports", desc: "Nhóm tuyển thủ thi đấu các bộ môn thể thao điện tử mô phỏng.", country: "Hoa Kỳ", captain: "Allez" }
    ];
  } else {
    teams = [
      { name: "Fnatic", desc: "Tổ chức Esports danh tiếng lâu đời tại Châu Âu.", country: "Thụy Điển", captain: "Boaster" },
      { name: "Team Liquid", desc: "Gã khổng lồ đa quốc gia có mặt tại hầu hết các bộ môn thi đấu.", country: "Hà Lan", captain: "Liki" },
      { name: "Gen.G Esports", desc: "Tổ chức lớn của Hàn Quốc dẫn đầu xu hướng Esports hiện đại.", country: "Hàn Quốc", captain: "Score" },
      { name: "GAM Esports", desc: "Đại diện ưu tú bậc nhất của Esports Việt Nam trên đấu trường quốc tế.", country: "Việt Nam", captain: "Levi" }
    ];
  }

  // Dynamic Players
  let players = [];
  if (gameType === 'fighting') {
    players = [
      { name: "Daigo (Daigo Umehara)", role: "Đấu sĩ kỳ cựu", team: "Team Beast", ach: "Huyền thoại 6x vô địch EVO", age: 45, country: "Nhật Bản" },
      { name: "MenaRD (Saul Leonardo)", role: "Đấu sĩ hạng nặng", team: "FURS Esports", ach: "2x Vô địch Capcom Cup", age: 26, country: "Cộng hòa Dominica" },
      { name: "AngryBird (Amjad Al-Shalabi)", role: "Đấu sĩ chiến thuật", team: "Red Bull Gaming", ach: "Vô địch EVO 2023", age: 28, country: "UAE" }
    ];
  } else if (gameType === 'sports') {
    players = [
      { name: "Tekkz (Donovan Hunt)", role: "Tuyển thủ chủ lực", team: "Man City Esports", ach: "Nhiều lần vô địch FC Pro Open", age: 24, country: "Vương Quốc Anh" },
      { name: "phzin (Paulo Henrique)", role: "Tuyển thủ tấn công", team: "PSG Esports", ach: "Vô địch Nam Mỹ", age: 22, country: "Brazil" },
      { name: "Nicolas99fc", role: "Bậc thầy phòng ngự", team: "Guild Esports", ach: "Á quân thế giới nhiều mùa", age: 26, country: "Argentina" }
    ];
  } else {
    players = [
      { name: "ApexPredator (Nguyễn Hùng)", role: "Rifler / Carry", team: "GAM Esports", ach: "MVP SEA Championship", age: 21, country: "Việt Nam" },
      { name: "Viper (John Doe)", role: "Flex / Captain", team: "Team Liquid", ach: "Vô địch quốc tế năm 2025", age: 24, country: "Hoa Kỳ" },
      { name: "Nova (Kim Min-jae)", role: "Sniper / Support", team: "Gen.G Esports", ach: "Vô địch giải quốc nội LCK", age: 23, country: "Hàn Quốc" }
    ];
  }

  // Dynamic Matches
  const matches = [
    { team1: teams[0].name, score1: 3, team2: teams[1].name, score2: 2, date: "10/05/2026", tournament: `${leagues[0].name} - Chung kết` },
    { team1: teams[2].name, score1: 2, team2: teams[3].name, score2: 0, date: "12/04/2026", tournament: `${leagues[1].name} - Vòng bảng` }
  ];

  return {
    name: cleanGameName,
    leagues,
    teams,
    players,
    matches
  };
}

// Function to render Esports section in Modal
function renderEsportsSection(details) {
  if (!modalEsportsSection) return;

  const genres = details.genres ? details.genres.map(g => g.name) : [];
  const tags = details.tags ? details.tags.map(t => t.name) : [];
  const esportsData = getEsportsData(details.name, genres, tags);

  if (!esportsData) {
    modalEsportsSection.style.display = 'none';
    return;
  }

  modalEsportsSection.style.display = 'block';

  // Active default tab 'leagues'
  esportsTabBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === 'leagues') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  esportsTabPanes.forEach(pane => {
    if (pane.id === 'esports-content-leagues') {
      pane.style.display = 'block';
    } else {
      pane.style.display = 'none';
    }
  });

  // Render Leagues
  if (esportsContentLeagues) {
    esportsContentLeagues.innerHTML = `<div class="esports-list">` + 
      esportsData.leagues.map(l => `
        <div class="esports-item-row">
          <div class="esports-avatar-round">🏆</div>
          <div class="esports-row-info">
            <div class="esports-row-title">${l.name}</div>
            <div class="esports-row-desc">${l.desc}</div>
          </div>
          <span class="esports-badge">${l.region}</span>
        </div>
      `).join('') + `</div>`;
  }

  // Render Teams
  if (esportsContentTeams) {
    esportsContentTeams.innerHTML = `<div class="esports-list">` + 
      esportsData.teams.map(t => `
        <div class="esports-item-row">
          <div class="esports-avatar-round">${t.name.substring(0, 2).toUpperCase()}</div>
          <div class="esports-row-info">
            <div class="esports-row-title">${t.name}</div>
            <div class="esports-row-desc">${t.desc}</div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px; flex-shrink:0;">
            <span class="esports-badge">${t.country}</span>
            <span style="font-size: 10px; color: var(--text-muted);">Capt: ${t.captain}</span>
          </div>
        </div>
      `).join('') + `</div>`;
  }

  // Render Players
  if (esportsContentPlayers) {
    esportsContentPlayers.innerHTML = `<div class="esports-list">` + 
      esportsData.players.map(p => `
        <div class="esports-item-row">
          <div class="esports-avatar-round">👤</div>
          <div class="esports-row-info">
            <div class="esports-row-title">${p.name}</div>
            <div class="esports-row-desc">Vai trò: ${p.role} | Đội tuyển: <strong>${p.team}</strong>${p.age ? ` | Tuổi: ${p.age}` : ''}</div>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px; flex-shrink:0;">
            ${p.country ? `<span class="esports-badge">${p.country}</span>` : ''}
            <span style="font-size: 10px; color: var(--text-muted); text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;" title="${p.ach}">${p.ach}</span>
          </div>
        </div>
      `).join('') + `</div>`;
  }

  // Render Matches
  if (esportsContentMatches) {
    esportsContentMatches.innerHTML = `<div class="esports-list">` + 
      esportsData.matches.map(m => `
        <div class="esports-match-card">
          <div class="esports-match-team">
            <div class="esports-avatar-round" style="width:24px; height:24px; font-size:10px; border-radius:4px;">${m.team1.substring(0,2).toUpperCase()}</div>
            <span class="esports-match-team-name" title="${m.team1}">${m.team1}</span>
          </div>
          <div class="esports-match-score-container">
            <div class="esports-match-score">${m.score1} - ${m.score2}</div>
            <span class="esports-match-date">${m.date}</span>
          </div>
          <div class="esports-match-team team-right">
            <span class="esports-match-team-name" style="text-align:right;" title="${m.team2}">${m.team2}</span>
            <div class="esports-avatar-round" style="width:24px; height:24px; font-size:10px; border-radius:4px;">${m.team2.substring(0,2).toUpperCase()}</div>
          </div>
        </div>
        <div style="font-size:10px; color:var(--text-muted); text-align:center; margin-top:-6px; margin-bottom:10px;">Giải đấu: ${m.tournament}</div>
      `).join('') + `</div>`;
  }
}

// Bind sub-tabs click events
if (esportsTabBtns.length > 0) {
  esportsTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      
      // Update active class on tab buttons
      esportsTabBtns.forEach(b => {
        if (b === btn) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      // Show matching pane
      esportsTabPanes.forEach(pane => {
        if (pane.id === `esports-content-${tab}`) {
          pane.style.display = 'block';
        } else {
          pane.style.display = 'none';
        }
      });
    });
  });
}

// Open Details modal and fetch raw details
export async function openGameDetails(gameId) {
  if (!gameDetailModal) return;

  if (modalEsportsSection) modalEsportsSection.style.display = 'none';
  if (esportsContentLeagues) esportsContentLeagues.innerHTML = '';
  if (esportsContentTeams) esportsContentTeams.innerHTML = '';
  if (esportsContentPlayers) esportsContentPlayers.innerHTML = '';
  if (esportsContentMatches) esportsContentMatches.innerHTML = '';

  if (modalJournalSection) modalJournalSection.style.display = 'none';
  if (journalAddForm) journalAddForm.style.display = 'none';
  if (btnToggleJournalForm) btnToggleJournalForm.textContent = '+ Thêm buổi chơi';
  if (journalSessionsList) journalSessionsList.innerHTML = '';
  if (inputSessionNotes) inputSessionNotes.value = '';

  if (modalStudioHq) modalStudioHq.textContent = '--';
  if (modalStudioEst) modalStudioEst.textContent = '--';

  // Set modal view in loading state
  gameDetailModal.classList.add('active');
  if (modalTitle) modalTitle.textContent = 'Đang tải thông tin...';
  if (modalReleaseDev) modalReleaseDev.textContent = '';
  if (modalDescription) modalDescription.innerHTML = '<div class="spinner" style="margin: 30px auto;"></div>';
  if (modalCoverImg) modalCoverImg.src = '';
  if (modalScreenshotsContainer) modalScreenshotsContainer.innerHTML = '';
  if (modalMetaScore) {
    modalMetaScore.textContent = '--';
    modalMetaScore.style.borderColor = 'var(--border-glass)';
  }
  if (selectGameStatus) selectGameStatus.value = 'none';
  if (btnDeleteModal) btnDeleteModal.classList.add('hidden');
  updateModalFieldsVisibility('none');

  if (modalGenres) modalGenres.textContent = '--';
  if (modalPlatforms) {
    modalPlatforms.textContent = '--';
    modalPlatforms.title = '';
  }
  if (modalPublishers) modalPublishers.textContent = '--';
  if (modalEsrb) modalEsrb.textContent = '--';
  if (modalPlaytime) modalPlaytime.textContent = '--';
  if (modalWebsite) {
    modalWebsite.href = '#';
    modalWebsite.style.display = 'none';
  }
  if (modalTagsContainer) modalTagsContainer.innerHTML = '';
  if (modalSimilarContainer) modalSimilarContainer.innerHTML = '<div style="color: var(--text-muted); font-size:12px;">Đang tải gợi ý...</div>';

  // Reset extended metadata fields
  if (modalMetacriticDetail) { modalMetacriticDetail.textContent = '--'; modalMetacriticDetail.title = ''; }
  if (modalAltNames) { modalAltNames.textContent = '--'; modalAltNames.title = ''; }
  if (modalAchievements) modalAchievements.textContent = '--';
  if (modalAddedCount) modalAddedCount.textContent = '--';
  if (modalReddit) { modalReddit.href = '#'; modalReddit.style.display = 'none'; }
  if (modalRatingsChartSection) modalRatingsChartSection.style.display = 'none';
  if (modalAdditionsSection) modalAdditionsSection.style.display = 'none';
  if (modalAdditionsContainer) modalAdditionsContainer.innerHTML = '';
  if (modalTeamSection) modalTeamSection.style.display = 'none';
  if (modalTeamContainer) modalTeamContainer.innerHTML = '';
  if (modalSeriesSection) modalSeriesSection.style.display = 'none';
  if (modalSeriesContainer) modalSeriesContainer.innerHTML = '';
  if (modalParentsSection) modalParentsSection.style.display = 'none';
  if (modalParentsContainer) modalParentsContainer.innerHTML = '';

  // Reset trailers and achievements list
  if (modalTrailersSection) modalTrailersSection.style.display = 'none';
  if (modalTrailerVideo) {
    modalTrailerVideo.pause();
    modalTrailerVideo.src = '';
  }
  const existingSwitcher = document.getElementById('modal-trailers-switcher-container');
  if (existingSwitcher) existingSwitcher.remove();
  if (modalAchievementsListSection) modalAchievementsListSection.style.display = 'none';
  if (modalAchievementsContainer) modalAchievementsContainer.innerHTML = '';
  if (modalRedditPostsSection) modalRedditPostsSection.style.display = 'none';
  if (modalRedditPostsContainer) modalRedditPostsContainer.innerHTML = '';
  if (modalTwitchSection) modalTwitchSection.style.display = 'none';
  if (modalTwitchContainer) modalTwitchContainer.innerHTML = '';
  if (modalYoutubeSection) modalYoutubeSection.style.display = 'none';
  if (modalYoutubeContainer) modalYoutubeContainer.innerHTML = '';

  // Check if this game is in our library and needs RAWG ID resolution
  let savedGame = state.localGames.find(g => g.id === gameId);
  if (savedGame && savedGame.needsResolution) {
    try {
      const searchData = await window.api.searchGames(savedGame.name, 1);
      if (searchData && searchData.results && searchData.results.length > 0) {
        const bestMatch = searchData.results.find(r => r.name.toLowerCase() === savedGame.name.toLowerCase()) || searchData.results[0];
        
        const oldId = savedGame.id;
        savedGame.id = bestMatch.id;
        savedGame.background_image = bestMatch.background_image || '';
        savedGame.metacritic = bestMatch.metacritic || null;
        savedGame.rawgIdResolved = true;
        delete savedGame.needsResolution;

        const idx = state.localGames.findIndex(g => g.id === oldId);
        if (idx !== -1) {
          state.localGames[idx] = savedGame;
          await saveGames(state.localGames);
        }
        
        // Point gameId to the new correct RAWG ID
        gameId = bestMatch.id;
        
        // Refresh grids and dashboard so covers update instantly
        updateLibraryStats();
        renderDashboard();
        const activeTabPane = document.getElementById(`view-${state.activeTab}`);
        if (activeTabPane && state.activeTab !== 'discover' && state.activeTab !== 'search') {
          renderListTab(state.activeTab);
        }
      }
    } catch (err) {
      console.error('Error resolving game on demand:', err);
    }
  }

  try {
    // Parallel fetches for details and screenshots
    const [details, screenData] = await Promise.all([
      window.api.getGameDetails(gameId),
      window.api.getGameScreenshots(gameId).catch(() => ({ results: [] })) // catch if fails
    ]);

    state.selectedGame = details;

    // Render dynamic blurred theme backdrop on modalContainer
    if (modalContainer && details.background_image) {
      modalContainer.style.backgroundImage = `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.98)), url(${details.background_image})`;
      modalContainer.style.backgroundSize = 'cover';
      modalContainer.style.backgroundPosition = 'center';
    } else if (modalContainer) {
      modalContainer.style.backgroundImage = 'none';
    }

    // Render title & meta
    if (modalTitle) modalTitle.textContent = details.name;
    const devs = details.developers && details.developers.length > 0 ? details.developers[0].name : 'Không rõ';
    if (modalReleaseDev) modalReleaseDev.textContent = `Ngày phát hành: ${details.released || 'Chưa rõ'} | Phát triển: ${devs}`;
    if (modalDescription) modalDescription.innerHTML = details.description || 'Không có mô tả chi tiết cho game này.';
    if (modalCoverImg) modalCoverImg.src = details.background_image || 'src/css/placeholder.svg';

    // Render details fields
    if (modalGenres) {
      modalGenres.innerHTML = '';
      if (details.genres && details.genres.length > 0) {
        details.genres.forEach((genre, idx) => {
          const span = document.createElement('span');
          span.textContent = genre.name;
          
          span.addEventListener('click', () => {
            if (gameDetailModal) gameDetailModal.classList.remove('active');
            switchTab('discover');
            browseByGenre(genre);
          });
          
          modalGenres.appendChild(span);
          if (idx < details.genres.length - 1) {
            modalGenres.appendChild(document.createTextNode(', '));
          }
        });
      } else {
        modalGenres.textContent = 'Không rõ';
      }
    }
    
    const platsText = details.platforms && details.platforms.length > 0 ? details.platforms.map(p => p.platform.name).join(', ') : 'Không rõ';
    if (modalPlatforms) {
      modalPlatforms.textContent = platsText;
      modalPlatforms.title = platsText;
    }
    
    if (modalPublishers) modalPublishers.textContent = details.publishers && details.publishers.length > 0 ? details.publishers.map(p => p.name).join(', ') : 'Không rõ';
    if (modalEsrb) modalEsrb.textContent = details.esrb_rating ? details.esrb_rating.name : 'Không phân loại';
    if (modalPlaytime) modalPlaytime.textContent = details.playtime ? `${details.playtime} giờ` : 'Chưa rõ';
    
    if (modalWebsite) {
      if (details.website) {
        modalWebsite.href = details.website;
        modalWebsite.textContent = 'Truy cập';
        modalWebsite.style.display = 'inline-block';
      } else {
        modalWebsite.style.display = 'none';
      }
    }

    // Render Extended Metadata
    // 1. Metacritic detailed platforms
    if (modalMetacriticDetail) {
      const mcPlats = details.metacritic_platforms;
      if (mcPlats && mcPlats.length > 0) {
        const text = mcPlats.map(mp => `${mp.platform.name}: ${mp.metascore}`).join(' | ');
        modalMetacriticDetail.textContent = text;
        modalMetacriticDetail.title = text;
      } else {
        modalMetacriticDetail.textContent = details.metacritic ? `Chung: ${details.metacritic}` : 'Không rõ';
      }
    }

    // 2. Alternative Names
    if (modalAltNames) {
      const alts = details.alternative_names;
      if (alts && alts.length > 0) {
        const text = alts.join(', ');
        modalAltNames.textContent = text;
        modalAltNames.title = text;
      } else {
        modalAltNames.textContent = 'Không có';
      }
    }

    // 3. Achievements Count
    if (modalAchievements) {
      modalAchievements.textContent = details.achievements_count ? `${details.achievements_count} thành tựu` : 'Không có';
    }

    // 4. Added Count
    if (modalAddedCount) {
      modalAddedCount.textContent = details.added ? `${details.added.toLocaleString()} người chơi` : 'Chưa rõ';
    }

    // 5. Reddit URL
    if (modalReddit) {
      if (details.reddit_url) {
        modalReddit.href = details.reddit_url;
        modalReddit.textContent = 'Mở Reddit';
        modalReddit.style.display = 'inline-block';
      } else {
        modalReddit.style.display = 'none';
      }
    }

    // Render Developer Location & Established Year
    if (modalStudioHq || modalStudioEst) {
      let hqText = 'Không rõ';
      let estText = 'Không rõ';
      
      const primaryDevName = details.developers && details.developers.length > 0 ? details.developers[0].name : null;
      const primaryPubName = details.publishers && details.publishers.length > 0 ? details.publishers[0].name : null;
      
      const devInfo = lookupCompanyInfo(primaryDevName);
      const pubInfo = lookupCompanyInfo(primaryPubName);
      
      if (devInfo) {
        hqText = devInfo.location || hqText;
        estText = devInfo.established ? `${devInfo.established}` : estText;
      } else if (pubInfo) {
        hqText = pubInfo.location || hqText;
        estText = pubInfo.established ? `${pubInfo.established}` : estText;
      }
      
      if (modalStudioHq) modalStudioHq.textContent = hqText;
      if (modalStudioEst) modalStudioEst.textContent = estText;
    }

    // 6. Ratings Bar Chart
    renderRatingsChart(details.ratings);

    // Render tags
    if (modalTagsContainer) {
      modalTagsContainer.innerHTML = '';
      if (details.tags && details.tags.length > 0) {
        details.tags.slice(0, 12).forEach(tag => {
          const span = document.createElement('span');
          span.className = 'tag-badge';
          span.textContent = tag.name;
          
          span.addEventListener('click', () => {
            if (gameDetailModal) gameDetailModal.classList.remove('active');
            switchTab('discover');
            browseByTag(tag);
          });
          
          modalTagsContainer.appendChild(span);
        });
      } else {
        modalTagsContainer.innerHTML = '<span style="color: var(--text-muted); font-size:12px;">Không có nhãn</span>';
      }
    }

    // Fetch and render similar/suggested games, using suggested endpoint first with fallback to tags
    const renderSimilarGames = (gamesList) => {
      if (modalSimilarContainer) {
        modalSimilarContainer.innerHTML = '';
        const filteredSim = (gamesList || []).filter(g => String(g.id) !== String(details.id) && !state.localGames.some(lg => String(lg.id) === String(g.id)));
        if (filteredSim.length > 0) {
          filteredSim.slice(0, 8).forEach(sim => {
            const item = document.createElement('div');
            item.className = 'similar-game-card';
            item.style.cssText = 'width: 100px; flex-shrink: 0; cursor: pointer; position: relative;';
            item.setAttribute('data-game-id', sim.id);

            item.innerHTML = `
              <div style="position: relative; width: 100px; height: 130px; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 1px solid var(--border-glass);">
                <img src="${sim.background_image || 'src/css/placeholder.svg'}" style="width: 100%; height: 100%; object-fit: cover;" alt="${sim.name}">
              </div>
              <div style="font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px; color: var(--text-light); text-align: center;" title="${sim.name}">${sim.name}</div>
            `;
            modalSimilarContainer.appendChild(item);
          });
        } else {
          modalSimilarContainer.innerHTML = '<span style="color: var(--text-muted); font-size:12px;">Không có gợi ý game tương tự nào hợp lệ</span>';
        }
      }
    };

    if (modalSimilarContainer) {
      modalSimilarContainer.innerHTML = '<div style="color: var(--text-muted); font-size:12px;">Đang tải gợi ý...</div>';
    }

    window.api.getGameSuggested(gameId, 15)
      .then(sugData => {
        if (sugData && sugData.results && sugData.results.length > 0) {
          renderSimilarGames(sugData.results);
        } else {
          throw new Error('No suggested games returned');
        }
      })
      .catch(() => {
        // Fallback to genre + tags-based similarity
        const genreIds = details.genres && details.genres.length > 0 
          ? details.genres.map(g => g.id).join(',') 
          : null;
        const tagIds = details.tags && details.tags.length > 0 
          ? details.tags.slice(0, 3).map(t => t.id).join(',') 
          : null;

        if (tagIds || genreIds) {
          window.api.getSimilarGames(tagIds, genreIds, 15)
            .then(simData => {
              if (simData && simData.results && simData.results.length > 1) {
                renderSimilarGames(simData.results);
              } else if (genreIds) {
                // If too few results, query just by genre for high-quality recommendations of the same genre
                window.api.getSimilarGames(null, genreIds, 15)
                  .then(genreData => {
                    renderSimilarGames(genreData.results || []);
                  })
                  .catch(err => {
                    console.error('Lỗi khi tải game tương tự bằng genre:', err);
                    renderSimilarGames(simData.results || []);
                  });
              } else {
                renderSimilarGames(simData.results || []);
              }
            })
            .catch(err => {
              console.error('Lỗi khi tải game tương tự bằng tag & genre:', err);
              if (genreIds) {
                window.api.getSimilarGames(null, genreIds, 15)
                  .then(genreData => {
                    renderSimilarGames(genreData.results || []);
                  })
                  .catch(e => {
                    console.error('Lỗi khi tải game tương tự bằng genre (catch):', e);
                    if (modalSimilarContainer) {
                      modalSimilarContainer.innerHTML = '<span style="color: var(--text-muted); font-size:12px;">Không thể tải game tương tự</span>';
                    }
                  });
              } else {
                if (modalSimilarContainer) {
                  modalSimilarContainer.innerHTML = '<span style="color: var(--text-muted); font-size:12px;">Không thể tải game tương tự</span>';
                }
              }
            });
        } else {
          if (modalSimilarContainer) {
            modalSimilarContainer.innerHTML = '<span style="color: var(--text-muted); font-size:12px;">Không có game tương tự</span>';
          }
        }
      });

    // Fetch and render additions (DLCs, editions)
    window.api.getGameAdditions(gameId, 12)
      .then(addData => {
        if (modalAdditionsSection && modalAdditionsContainer) {
          modalAdditionsContainer.innerHTML = '';
          if (addData && addData.results && addData.results.length > 0) {
            modalAdditionsSection.style.display = 'block';
            addData.results.forEach(add => {
              const item = document.createElement('div');
              item.className = 'similar-game-card'; // Reuse identical styling
              item.style.cssText = 'width: 100px; flex-shrink: 0; cursor: pointer; position: relative;';
              item.setAttribute('data-game-id', add.id);

              item.innerHTML = `
                <div style="position: relative; width: 100px; height: 130px; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 1px solid var(--border-glass);">
                  <img src="${add.background_image || 'src/css/placeholder.svg'}" style="width: 100%; height: 100%; object-fit: cover;" alt="${add.name}">
                </div>
                <div style="font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px; color: var(--text-light); text-align: center;" title="${add.name}">${add.name}</div>
              `;
              modalAdditionsContainer.appendChild(item);
            });
          } else {
            modalAdditionsSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải game additions:', err);
        if (modalAdditionsSection) modalAdditionsSection.style.display = 'none';
      });

    // Fetch and render development team
    window.api.getGameDevelopmentTeam(gameId, 12)
      .then(teamData => {
        if (modalTeamSection && modalTeamContainer) {
          modalTeamContainer.innerHTML = '';
          if (teamData && teamData.results && teamData.results.length > 0) {
            modalTeamSection.style.display = 'block';
            teamData.results.forEach(member => {
              const item = document.createElement('div');
              item.className = 'team-member-card';
              item.style.cssText = 'width: 100px; flex-shrink: 0; text-align: center; position: relative; cursor: pointer;';
              
              item.addEventListener('click', () => {
                if (gameDetailModal) gameDetailModal.classList.remove('active');
                switchTab('discover');
                browseByCreator(member);
              });

              const roleText = member.positions && member.positions.length > 0 ? member.positions[0].name : 'Developer';

              item.innerHTML = `
                <div style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; margin: 0 auto 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid var(--border-glass); background-color: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;">
                  ${member.image ? `<img src="${member.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${member.name}">` : `<svg viewBox="0 0 24 24" width="36" height="36" style="color: var(--text-muted);"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`}
                </div>
                <div style="font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-white);" title="${member.name}">${member.name}</div>
                <div style="font-size: 9px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${roleText}">${roleText}</div>
              `;
              modalTeamContainer.appendChild(item);
            });
          } else {
            modalTeamSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải game development-team:', err);
        if (modalTeamSection) modalTeamSection.style.display = 'none';
      });

    // Fetch and render game series
    window.api.getGameSeries(gameId, 40)
      .then(seriesData => {
        if (state.selectedGame) {
          state.selectedGame.seriesGameIds = (seriesData && seriesData.results) ? seriesData.results.map(r => r.id) : [];
        }
        if (modalSeriesSection && modalSeriesContainer) {
          modalSeriesContainer.innerHTML = '';
          if (seriesData && seriesData.results && seriesData.results.length > 0) {
            modalSeriesSection.style.display = 'block';
            seriesData.results.slice(0, 12).forEach(ser => {
              const item = document.createElement('div');
              item.className = 'similar-game-card'; // Reuse identical styling
              item.style.cssText = 'width: 100px; flex-shrink: 0; cursor: pointer; position: relative;';
              item.setAttribute('data-game-id', ser.id);

              item.innerHTML = `
                <div style="position: relative; width: 100px; height: 130px; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 1px solid var(--border-glass);">
                   <img src="${ser.background_image || 'src/css/placeholder.svg'}" style="width: 100%; height: 100%; object-fit: cover;" alt="${ser.name}">
                </div>
                <div style="font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px; color: var(--text-light); text-align: center;" title="${ser.name}">${ser.name}</div>
              `;
              modalSeriesContainer.appendChild(item);
            });
          } else {
            modalSeriesSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải game series:', err);
        if (modalSeriesSection) modalSeriesSection.style.display = 'none';
      });

    // Fetch and render parent games (Base Game)
    window.api.getGameParents(gameId, 12)
      .then(parentsData => {
        if (modalParentsSection && modalParentsContainer) {
          modalParentsContainer.innerHTML = '';
          if (parentsData && parentsData.results && parentsData.results.length > 0) {
            modalParentsSection.style.display = 'block';
            parentsData.results.forEach(parent => {
              const item = document.createElement('div');
              item.className = 'similar-game-card'; // Reuse identical styling
              item.style.cssText = 'width: 100px; flex-shrink: 0; cursor: pointer; position: relative;';
              item.setAttribute('data-game-id', parent.id);

              item.innerHTML = `
                <div style="position: relative; width: 100px; height: 130px; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 1px solid var(--border-glass);">
                  <img src="${parent.background_image || 'src/css/placeholder.svg'}" style="width: 100%; height: 100%; object-fit: cover;" alt="${parent.name}">
                </div>
                <div style="font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px; color: var(--text-light); text-align: center;" title="${parent.name}">${parent.name}</div>
              `;
              modalParentsContainer.appendChild(item);
            });
          } else {
            modalParentsSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải base game:', err);
        if (modalParentsSection) modalParentsSection.style.display = 'none';
      });

    // Fetch and render purchase stores links
    window.api.getGameStores(gameId, 12)
      .then(storesData => {
        const modalStoresSection = document.getElementById('modal-stores-section');
        const modalStoresContainer = document.getElementById('modal-stores-container');
        if (modalStoresSection && modalStoresContainer) {
          modalStoresContainer.innerHTML = '';
          if (storesData && storesData.results && storesData.results.length > 0) {
            modalStoresSection.style.display = 'block';
            storesData.results.forEach(item => {
              if (item.url) {
                const storeNames = {
                  1: 'Steam',
                  2: 'Microsoft Store',
                  3: 'PlayStation Store',
                  4: 'Xbox Store',
                  5: 'App Store',
                  6: 'Google Play',
                  7: 'Xbox 360 Store',
                  8: 'Google Play',
                  9: 'itch.io',
                  11: 'Epic Games Store',
                  12: 'GOG'
                };
                
                const name = storeNames[item.store_id] || 'Cửa hàng';
                
                const link = document.createElement('a');
                link.className = 'store-link-btn';
                link.href = item.url;
                link.target = '_blank';
                link.innerHTML = `
                  <svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align: middle; margin-right: 4px;"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/></svg>
                  <span>${name}</span>
                `;
                modalStoresContainer.appendChild(link);
              }
            });
            if (modalStoresContainer.children.length === 0) {
              modalStoresSection.style.display = 'none';
            }
          } else {
            modalStoresSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải stores:', err);
        const modalStoresSection = document.getElementById('modal-stores-section');
        if (modalStoresSection) modalStoresSection.style.display = 'none';
      });

    // Hardware specifications comparison
    renderSpecsComparison(details);

    // Metacritic large score
    const metacritic = details.metacritic;
    if (modalMetaScore) {
      if (metacritic) {
        modalMetaScore.textContent = metacritic;
        if (metacritic >= 75) modalMetaScore.style.borderColor = '#ffffff';
        else if (metacritic >= 50) modalMetaScore.style.borderColor = '#a3a3a3';
        else modalMetaScore.style.borderColor = '#404040';
      } else {
        modalMetaScore.textContent = '--';
        modalMetaScore.style.borderColor = 'var(--border-glass)';
      }
    }

    // Screenshots slider
    if (modalScreenshotsContainer) {
      if (screenData.results && screenData.results.length > 0) {
        screenData.results.slice(0, 5).forEach(scr => {
          const img = document.createElement('img');
          img.src = scr.image;
          img.className = 'screenshot-thumbnail';
          img.addEventListener('click', () => {
            if (modalCoverImg) modalCoverImg.src = scr.image;
          });
          modalScreenshotsContainer.appendChild(img);
        });
      } else {
        modalScreenshotsContainer.innerHTML = '<span style="color: var(--text-muted); font-size:12px;">Không có screenshot</span>';
      }
    }

    // Fetch and render trailers
    window.api.getGameTrailers(gameId, 3)
      .then(trailerData => {
        if (modalTrailersSection && modalTrailerVideo) {
          modalTrailerVideo.src = '';
          modalTrailerVideo.pause();
          
          const existingSwitcher = document.getElementById('modal-trailers-switcher-container');
          if (existingSwitcher) existingSwitcher.remove();

          if (trailerData && trailerData.results && trailerData.results.length > 0) {
            modalTrailersSection.style.display = 'block';
            
            const switcherContainer = document.createElement('div');
            switcherContainer.id = 'modal-trailers-switcher-container';
            switcherContainer.style.cssText = 'display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;';
            modalTrailersSection.appendChild(switcherContainer);
            
            const setTrailer = (trailer, btnEl) => {
              const videoUrl = trailer.data ? (trailer.data.max || trailer.data['480']) : null;
              if (videoUrl) {
                modalTrailerVideo.src = videoUrl;
                modalTrailerVideo.poster = trailer.preview || '';
                switcherContainer.querySelectorAll('button').forEach(btn => {
                  btn.style.borderColor = 'var(--border-glass)';
                  btn.style.background = 'rgba(255,255,255,0.05)';
                });
                if (btnEl) {
                  btnEl.style.borderColor = 'var(--accent-purple)';
                  btnEl.style.background = 'rgba(139, 92, 246, 0.1)';
                }
              }
            };
            
            if (trailerData.results.length > 1) {
              trailerData.results.forEach((trailer, index) => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-secondary';
                btn.style.cssText = 'padding: 4px 8px; font-size: 11px; display: flex; align-items: center; gap: 4px; border: 1px solid var(--border-glass); border-radius: 4px; background: rgba(255,255,255,0.05); color: var(--text-light); cursor: pointer; transition: all 0.2s;';
                btn.innerHTML = `
                  <svg viewBox="0 0 24 24" width="12" height="12"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                  <span>Video ${index + 1}</span>
                `;
                btn.addEventListener('click', () => setTrailer(trailer, btn));
                switcherContainer.appendChild(btn);
              });
              
              setTrailer(trailerData.results[0], switcherContainer.firstChild);
            } else {
              setTrailer(trailerData.results[0], null);
              switcherContainer.remove();
            }
          } else {
            modalTrailersSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải trailers:', err);
        if (modalTrailersSection) modalTrailersSection.style.display = 'none';
      });

    // Fetch and render achievements list
    window.api.getGameAchievements(gameId, 12)
      .then(achData => {
        if (modalAchievementsListSection && modalAchievementsContainer) {
          modalAchievementsContainer.innerHTML = '';
          if (achData && achData.results && achData.results.length > 0) {
            modalAchievementsListSection.style.display = 'block';
            achData.results.forEach(ach => {
              const item = document.createElement('div');
              item.className = 'achievement-card';
              item.style.cssText = 'width: 120px; flex-shrink: 0; text-align: center; position: relative; background: rgba(255,255,255,0.03); border: 1px solid var(--border-glass); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: space-between;';

              const imgUrl = ach.image || 'src/css/placeholder.svg';
              const name = ach.name || 'Thành tựu';
              const desc = ach.description || 'Không có mô tả';
              const percent = ach.percent !== undefined ? `${parseFloat(ach.percent).toFixed(1)}%` : 'Chưa rõ';

              item.innerHTML = `
                <div style="width: 54px; height: 54px; border-radius: 8px; overflow: hidden; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); border: 1px solid var(--border-glass); background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
                  <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${name}">
                </div>
                <div style="font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-white); width: 100%; margin-bottom: 2px;" title="${name}">${name}</div>
                <div style="font-size: 9px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; margin-bottom: 6px;" title="${desc}">${desc}</div>
                <div style="font-size: 9px; font-weight: 700; color: var(--accent-purple); background: rgba(139, 92, 246, 0.15); padding: 2px 6px; border-radius: 4px; display: inline-block;">
                  🏆 ${percent}
                </div>
              `;
              modalAchievementsContainer.appendChild(item);
            });
          } else {
            modalAchievementsListSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải achievements:', err);
        if (modalAchievementsListSection) modalAchievementsListSection.style.display = 'none';
      });

    // Fetch and render Reddit posts
    window.api.getGameRedditPosts(gameId, 5)
      .then(redditData => {
        if (modalRedditPostsSection && modalRedditPostsContainer) {
          modalRedditPostsContainer.innerHTML = '';
          if (redditData && redditData.results && redditData.results.length > 0) {
            modalRedditPostsSection.style.display = 'block';
            
            redditData.results.forEach(post => {
              const card = document.createElement('div');
              card.className = 'reddit-post-card';
              card.style.cssText = 'background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-glass); border-radius: 8px; padding: 12px; display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px;';

              let dateStr = '';
              if (post.created) {
                try {
                  const date = new Date(post.created);
                  dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                } catch(e) {}
              }

              let cleanText = post.text ? post.text.replace(/<[^>]*>/g, '').trim() : '';
              if (cleanText.length > 180) {
                cleanText = cleanText.substring(0, 180) + '...';
              }

              const leftContent = `
                <div style="flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0;">
                  <div style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--text-muted);">
                    <svg viewBox="0 0 24 24" width="12" height="12" style="color: var(--text-light); flex-shrink: 0;"><path fill="currentColor" d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.75-1.64-5.99-1.72l1.27-3.99 4.14.88c.02.69.58 1.25 1.27 1.25 1.1 0 2-.9 2-2s-.9-2-2-2c-.93 0-1.7.64-1.92 1.5l-4.63-1c-.24-.04-.47.1-.53.33l-1.46 4.62c-2.32.06-4.52.7-6.2 1.72-.56-.75-1.46-1.24-2.42-1.24-1.65 0-3 1.35-3 3 0 1.05.54 1.97 1.37 2.51-.04.29-.07.58-.07.87 0 4.14 4.93 7.5 11 7.5s11-3.36 11-7.5c0-.29-.03-.58-.07-.87.83-.54 1.37-1.46 1.37-2.51zm-18 1c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm10.7 4.9c-.83.83-2.4 1.1-3.2 1.1s-2.37-.27-3.2-1.1c-.2-.2-.2-.51 0-.71.2-.2.51-.2.71 0 .6.6 1.7.8 2.49.8s1.89-.2 2.49-.8c.2-.2.51-.2.71 0 .2.2.2.51 0 .71zm-.7-3.4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                    <span>Đăng bởi <strong>u/${post.username || 'ẩn danh'}</strong></span>
                    ${dateStr ? `<span>•</span> <span>${dateStr}</span>` : ''}
                  </div>
                  <a href="${post.url}" target="_blank" style="font-size: 13px; font-weight: 700; color: var(--text-white); text-decoration: none; line-height: 1.3; word-break: break-word;" class="reddit-title-link">
                    ${post.name || 'Bài viết không có tiêu đề'}
                  </a>
                  ${cleanText ? `<p style="font-size: 11px; color: var(--text-light); line-height: 1.4; margin: 0; word-break: break-word;">${cleanText}</p>` : ''}
                </div>
              `;

              const rightContent = post.image ? `
                <a href="${post.url}" target="_blank" style="flex-shrink: 0; width: 70px; height: 70px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-glass);">
                  <img src="${post.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="Reddit thumbnail">
                </a>
              ` : '';

              card.innerHTML = leftContent + rightContent;
              modalRedditPostsContainer.appendChild(card);
            });

            // Add custom hover styles for title links if not already there
            const customStylesId = 'reddit-custom-styles';
            if (!document.getElementById(customStylesId)) {
              const style = document.createElement('style');
              style.id = customStylesId;
              style.textContent = `
                .reddit-title-link:hover {
                  color: var(--accent-purple) !important;
                  text-decoration: underline !important;
                }
              `;
              document.head.appendChild(style);
            }
          } else {
            modalRedditPostsSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải reddit posts:', err);
        if (modalRedditPostsSection) modalRedditPostsSection.style.display = 'none';
      });

    // Fetch and render Twitch streams
    window.api.getGameTwitch(gameId, 5)
      .then(twitchData => {
        if (modalTwitchSection && modalTwitchContainer) {
          modalTwitchContainer.innerHTML = '';
          if (twitchData && twitchData.results && twitchData.results.length > 0) {
            modalTwitchSection.style.display = 'block';
            twitchData.results.forEach(stream => {
              const item = document.createElement('a');
              item.href = stream.url || `https://www.twitch.tv/${stream.user_name || stream.name}`;
              item.target = '_blank';
              item.className = 'twitch-stream-card';
              item.style.cssText = 'width: 150px; flex-shrink: 0; text-decoration: none; display: flex; flex-direction: column; gap: 4px; cursor: pointer;';

              const viewText = stream.view_count !== undefined ? `👁️ ${stream.view_count.toLocaleString()}` : '';

              item.innerHTML = `
                <div style="position: relative; width: 150px; height: 85px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-glass); background: #000;">
                  ${viewText ? `<div style="position: absolute; bottom: 4px; left: 4px; background: rgba(0,0,0,0.8); color: #fff; font-size: 8px; padding: 2px 4px; border-radius: 3px; font-weight: bold;">${viewText}</div>` : ''}
                  <div style="position: absolute; top: 4px; right: 4px; background: #3f3f46; color: #fff; font-size: 8px; padding: 2px 4px; border-radius: 3px; font-weight: bold; text-transform: uppercase;">Live</div>
                </div>
                <div style="font-size: 11px; font-weight: 700; color: var(--text-white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;" title="${stream.name}">${stream.name}</div>
                <div style="font-size: 9px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${stream.user_name || 'Streamer'}</div>
              `;
              modalTwitchContainer.appendChild(item);
            });
          } else {
            modalTwitchSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải Twitch streams:', err);
        if (modalTwitchSection) modalTwitchSection.style.display = 'none';
      });

    // Fetch and render YouTube videos
    window.api.getGameYoutube(gameId, 5)
      .then(youtubeData => {
        if (modalYoutubeSection && modalYoutubeContainer) {
          modalYoutubeContainer.innerHTML = '';
          if (youtubeData && youtubeData.results && youtubeData.results.length > 0) {
            modalYoutubeSection.style.display = 'block';
            youtubeData.results.forEach(video => {
              const item = document.createElement('a');
              item.href = `https://www.youtube.com/watch?v=${video.external_id}`;
              item.target = '_blank';
              item.className = 'youtube-video-card';
              item.style.cssText = 'width: 150px; flex-shrink: 0; text-decoration: none; display: flex; flex-direction: column; gap: 4px; cursor: pointer;';

              const thumbUrl = video.thumbnails && video.thumbnails.high ? video.thumbnails.high.url : 
                               (video.thumbnails && video.thumbnails.medium ? video.thumbnails.medium.url : 
                                (video.thumbnails && video.thumbnails.default ? video.thumbnails.default.url : 'src/css/placeholder.svg'));

              item.innerHTML = `
                <div style="position: relative; width: 150px; height: 85px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-glass); background: #000;">
                  <img src="${thumbUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${video.name}">
                  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 28px; height: 28px; background: rgba(239, 68, 68, 0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
                    <svg viewBox="0 0 24 24" width="14" height="14" style="color: #fff; margin-left: 2px;"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div style="font-size: 11px; font-weight: 700; color: var(--text-white); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 28px; line-height: 1.3;" title="${video.name}">${video.name}</div>
                <div style="font-size: 9px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;">${video.channel_title || 'YouTube'}</div>
              `;
              modalYoutubeContainer.appendChild(item);
            });
          } else {
            modalYoutubeSection.style.display = 'none';
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải YouTube videos:', err);
        if (modalYoutubeSection) modalYoutubeSection.style.display = 'none';
      });

    // Check if this game is already saved in our local catalog
    const saved = state.localGames.find(g => g.id === gameId);
    if (saved) {
      if (selectGameStatus) selectGameStatus.value = saved.status;
      if (btnDeleteModal) btnDeleteModal.classList.remove('hidden');
      updateModalFieldsVisibility(saved.status);

      if (rowSubstatusPlatform) rowSubstatusPlatform.classList.remove('hidden');
      updateSubstatusDropdown(saved.status, saved.subStatus || 'none');
      updatePlatformDropdown(details, saved);

      // Populate status specific fields
      if (saved.status === 'playing') {
        if (inputPlayingHours) inputPlayingHours.value = saved.playingHours || 0;
        if (inputPlayingStart) inputPlayingStart.value = saved.startDate || '';
        if (inputPlayingNotes) inputPlayingNotes.value = saved.notes || '';
      } else if (saved.status === 'backlog') {
        if (selectBacklogPriority) selectBacklogPriority.value = saved.priority || 'medium';
      } else if (saved.status === 'completed') {
        setModalStarRating(saved.rating || 0);
        if (inputCompletedDate) inputCompletedDate.value = saved.endDate || '';
        if (inputCompletedReview) inputCompletedReview.value = saved.review || '';
      }
      
      renderJournalSection(saved);
    } else {
      // Default placeholder fields
      if (selectGameStatus) selectGameStatus.value = 'none';
      if (btnDeleteModal) btnDeleteModal.classList.add('hidden');
      if (rowSubstatusPlatform) rowSubstatusPlatform.classList.add('hidden');
      updateModalFieldsVisibility('none');
      updateSubstatusDropdown('none', 'none');
      updatePlatformDropdown(details, null);
      
      if (inputPlayingHours) inputPlayingHours.value = 0;
      if (inputPlayingStart) inputPlayingStart.value = new Date().toISOString().split('T')[0];
      if (inputPlayingNotes) inputPlayingNotes.value = '';
      if (selectBacklogPriority) selectBacklogPriority.value = 'medium';
      setModalStarRating(0);
      if (inputCompletedDate) inputCompletedDate.value = new Date().toISOString().split('T')[0];
      if (inputCompletedReview) inputCompletedReview.value = '';

      if (modalJournalSection) modalJournalSection.style.display = 'none';
    }

    renderEsportsSection(details);

  } catch (err) {
    console.error('Lỗi lấy chi tiết game:', err);
    if (modalTitle) modalTitle.textContent = 'Lỗi tải thông tin game';
    if (modalDescription) {
      modalDescription.innerHTML = `<p style="color: var(--accent-danger)">Có lỗi xảy ra: ${err.message}. Đảm bảo kết nối mạng và API Key của bạn đang hoạt động bình thường.</p>`;
    }
  }
}

// Render ratings distribution bar chart dynamically
function renderRatingsChart(ratings) {
  if (!modalRatingsChartSection || !modalRatingsChart || !modalRatingsLegend) return;
  
  modalRatingsChart.innerHTML = '';
  modalRatingsLegend.innerHTML = '';
  
  if (ratings && ratings.length > 0) {
    modalRatingsChartSection.style.display = 'block';
    
    const order = ['exceptional', 'recommended', 'meh', 'skip'];
    const sorted = [...ratings].sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
    
    const colors = {
      exceptional: '#ffffff', // White
      recommended: '#d1d5db', // Light Gray
      meh: '#9ca3af',         // Gray
      skip: '#4b5563'         // Dark Gray
    };
    
    const labels = {
      exceptional: '🏆 Siêu phẩm',
      recommended: '👍 Khuyên chơi',
      meh: '😐 Tạm được',
      skip: '👎 Bỏ qua'
    };

    sorted.forEach(rating => {
      const pct = rating.percent;
      if (pct > 0) {
        // Create bar segment
        const segment = document.createElement('div');
        segment.className = 'rating-bar-segment';
        segment.style.width = `${pct}%`;
        segment.style.height = '100%';
        segment.style.backgroundColor = colors[rating.title] || '#ccc';
        segment.style.transition = 'width 0.3s ease';
        segment.title = `${labels[rating.title] || rating.title}: ${pct.toFixed(1)}% (${rating.count} vote)`;
        modalRatingsChart.appendChild(segment);
        
        // Create legend item
        const legendItem = document.createElement('div');
        legendItem.className = 'rating-legend-item';
        legendItem.style.cssText = 'display: flex; align-items: center; gap: 5px; font-size: 11px; margin-right: 12px; margin-bottom: 6px;';
        legendItem.innerHTML = `
          <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${colors[rating.title] || '#ccc'}; display: inline-block;"></span>
          <span style="font-weight: 500; color: var(--text-white);">${labels[rating.title] || rating.title}:</span>
          <span style="color: var(--text-muted);">${pct.toFixed(1)}%</span>
        `;
        modalRatingsLegend.appendChild(legendItem);
      }
    });
  } else {
    modalRatingsChartSection.style.display = 'none';
  }
}

// Update substatus options dynamically based on status selection
export function updateSubstatusDropdown(mainStatus, selectedVal = 'none') {
  if (!selectGameSubstatus) return;
  selectGameSubstatus.innerHTML = '';
  const options = SUB_STATUS_OPTIONS[mainStatus] || SUB_STATUS_OPTIONS.none;
  options.forEach(opt => {
    const el = document.createElement('option');
    el.value = opt.value;
    el.textContent = opt.label;
    selectGameSubstatus.appendChild(el);
  });
  selectGameSubstatus.value = selectedVal;
}

// Update platform selector options
export function updatePlatformDropdown(gameDetails, savedGame = null) {
  if (!selectGamePlatform) return;
  selectGamePlatform.innerHTML = '<option value="none">Chưa chọn hệ máy</option>';
  
  let platformsList = [];
  if (gameDetails && gameDetails.platforms) {
    platformsList = gameDetails.platforms.map(p => p.platform.name);
  }
  
  if (platformsList.length === 0) {
    platformsList = ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X|S', 'Nintendo Switch', 'Android', 'iOS', 'macOS'];
  }

  const uniquePlatforms = [...new Set(platformsList)];
  uniquePlatforms.forEach(plat => {
    const el = document.createElement('option');
    el.value = plat;
    el.textContent = plat;
    selectGamePlatform.appendChild(el);
  });
  
  if (savedGame && savedGame.platform) {
    selectGamePlatform.value = savedGame.platform;
  } else {
    selectGamePlatform.value = 'none';
  }
}

// Show/hide status input blocks in Modal
export function updateModalFieldsVisibility(status) {
  if (fieldsPlaying) fieldsPlaying.classList.add('hidden');
  if (fieldsBacklog) fieldsBacklog.classList.add('hidden');
  if (fieldsCompleted) fieldsCompleted.classList.add('hidden');

  if (status === 'playing') {
    if (fieldsPlaying) fieldsPlaying.classList.remove('hidden');
  } else if (status === 'backlog') {
    if (fieldsBacklog) fieldsBacklog.classList.remove('hidden');
  } else if (status === 'completed') {
    if (fieldsCompleted) fieldsCompleted.classList.remove('hidden');
  }
}

// Modal star rating visualizer helper
export function setModalStarRating(ratingVal) {
  state.currentRating = ratingVal;
  starBtns.forEach(btn => {
    const val = parseInt(btn.getAttribute('data-value'));
    if (val <= ratingVal) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

export function closeModal() {
  if (gameDetailModal) gameDetailModal.classList.remove('active');
  state.selectedGame = null;
  if (modalContainer) {
    modalContainer.style.backgroundImage = 'none';
  }
  if (modalTrailerVideo) {
    modalTrailerVideo.pause();
    modalTrailerVideo.src = '';
  }

  // Deep DOM cleanup of list containers to prevent memory leaks and release reference handlers instantly
  if (modalScreenshotsContainer) modalScreenshotsContainer.innerHTML = '';
  if (modalTagsContainer) modalTagsContainer.innerHTML = '';
  if (modalSimilarContainer) modalSimilarContainer.innerHTML = '';
  if (modalAdditionsContainer) modalAdditionsContainer.innerHTML = '';
  if (modalTeamContainer) modalTeamContainer.innerHTML = '';
  if (modalSeriesContainer) modalSeriesContainer.innerHTML = '';
  if (modalParentsContainer) modalParentsContainer.innerHTML = '';
  if (modalAchievementsContainer) modalAchievementsContainer.innerHTML = '';
  if (modalRedditPostsContainer) modalRedditPostsContainer.innerHTML = '';
  if (modalTwitchContainer) modalTwitchContainer.innerHTML = '';
  if (modalYoutubeContainer) modalYoutubeContainer.innerHTML = '';

  const modalStoresContainer = document.getElementById('modal-stores-container');
  if (modalStoresContainer) modalStoresContainer.innerHTML = '';

  const existingSwitcher = document.getElementById('modal-trailers-switcher-container');
  if (existingSwitcher) existingSwitcher.remove();

  // Reset Esports section
  if (modalEsportsSection) modalEsportsSection.style.display = 'none';
  if (esportsContentLeagues) esportsContentLeagues.innerHTML = '';
  if (esportsContentTeams) esportsContentTeams.innerHTML = '';
  if (esportsContentPlayers) esportsContentPlayers.innerHTML = '';
  if (esportsContentMatches) esportsContentMatches.innerHTML = '';

  // Reset Studio/Company info
  if (modalStudioHq) modalStudioHq.textContent = '--';
  if (modalStudioEst) modalStudioEst.textContent = '--';
}

// Save or Update Game state
export async function saveModalGame() {
  if (!state.selectedGame) return;

  const status = selectGameStatus.value;
  const gameId = state.selectedGame.id;

  if (status === 'none') {
    // If set to none, delete if existed, or just close
    await deleteModalGame(true);
    return;
  }

  // Build the game data to save
  const genres = state.selectedGame.genres ? state.selectedGame.genres.map(g => g.name) : [];
  
  const gameRecord = {
    id: state.selectedGame.id,
    name: state.selectedGame.name,
    background_image: state.selectedGame.background_image,
    genres: genres,
    released: state.selectedGame.released,
    metacritic: state.selectedGame.metacritic,
    status: status,
    subStatus: selectGameSubstatus.value,
    platform: selectGamePlatform.value,
    updatedAt: Date.now(),
    seriesGameIds: state.selectedGame.seriesGameIds || []
  };

  // Add specific fields based on status
  if (status === 'playing') {
    gameRecord.playingHours = parseFloat(inputPlayingHours.value) || 0;
    gameRecord.startDate = inputPlayingStart.value;
    gameRecord.notes = inputPlayingNotes.value.trim();
  } else if (status === 'backlog') {
    gameRecord.priority = selectBacklogPriority.value;
  } else if (status === 'completed') {
    gameRecord.rating = state.currentRating;
    gameRecord.endDate = inputCompletedDate.value;
    gameRecord.review = inputCompletedReview.value.trim();
  }

  const existingIdx = state.localGames.findIndex(g => g.id === gameId);
  if (existingIdx !== -1) {
    gameRecord.sessions = state.localGames[existingIdx].sessions || [];
    gameRecord.createdAt = state.localGames[existingIdx].createdAt || Date.now();
    state.localGames[existingIdx] = gameRecord;
  } else {
    gameRecord.sessions = [];
    gameRecord.createdAt = Date.now();
    state.localGames.push(gameRecord);
  }

  // Save to disk
  const success = await saveGames(state.localGames);
  if (success) {
    updateLibraryStats();
    renderDashboard();
    
    // Refresh library tab if we are currently inside library view
    if (state.activeTab !== 'discover' && state.activeTab !== 'search' && state.activeTab !== 'dashboard') {
      renderListTab(state.activeTab);
    } else if (state.activeTab === 'discover' || state.activeTab === 'search') {
      if (state.activeTab === 'search') {
        if (state.searchGamesBuffer) {
          const filtered = state.searchGamesBuffer.filter(game => !state.localGames.some(g => String(g.id) === String(game.id)));
          const pageResults = filtered.slice((state.searchPage - 1) * 15, state.searchPage * 15);
          renderRawgSearchResults(pageResults);
        }
      } else if (state.activeTab === 'discover') {
        const trendingGrid = document.getElementById('discover-trending-grid');
        const upcomingGrid = document.getElementById('discover-upcoming-grid');
        const browseResultsGrid = document.getElementById('browse-results-grid');
        
        if (trendingGrid && state.trendingGamesBuffer) {
          const filtered = state.trendingGamesBuffer.filter(game => !state.localGames.some(g => String(g.id) === String(game.id)));
          const pageResults = filtered.slice((state.trendingPage - 1) * 15, state.trendingPage * 15);
          renderDiscoverResults(pageResults, trendingGrid);
        }
        if (upcomingGrid && state.upcomingGamesBuffer) {
          const filtered = state.upcomingGamesBuffer.filter(game => !state.localGames.some(g => String(g.id) === String(game.id)));
          const pageResults = filtered.slice((state.upcomingPage - 1) * 15, state.upcomingPage * 15);
          renderDiscoverResults(pageResults, upcomingGrid);
        }
        if (browseResultsGrid && state.browseGamesBuffer) {
          const filtered = state.browseGamesBuffer.filter(game => !state.localGames.some(g => String(g.id) === String(game.id)));
          const pageResults = filtered.slice((state.browsePage - 1) * 15, state.browsePage * 15);
          renderDiscoverResults(pageResults, browseResultsGrid);
        }
      }
    }
    closeModal();
  } else {
    showAlert('Lỗi', 'Lỗi khi lưu game vào cơ sở dữ liệu cục bộ!', 'error');
  }
}

// Delete Game from library
export async function deleteModalGame(silent = false) {
  if (!state.selectedGame) return;
  
  const gameId = state.selectedGame.id;
  const existingIdx = state.localGames.findIndex(g => g.id === gameId);

  if (existingIdx !== -1) {
    if (!silent) {
      const confirmDelete = await showConfirm('Xác nhận xóa', `Bạn có chắc muốn xóa "${state.selectedGame.name}" khỏi thư viện?`);
      if (!confirmDelete) return;
    }

    state.localGames.splice(existingIdx, 1);
    const success = await saveGames(state.localGames);
    
    if (success) {
      updateLibraryStats();
      renderDashboard();
      
      // Refresh library tab if we are currently inside library view
      if (state.activeTab !== 'discover' && state.activeTab !== 'search' && state.activeTab !== 'dashboard') {
        renderListTab(state.activeTab);
      } else if (state.activeTab === 'discover' || state.activeTab === 'search') {
        if (state.activeTab === 'search') {
          if (state.searchGamesBuffer) {
            const filtered = state.searchGamesBuffer.filter(game => !state.localGames.some(g => String(g.id) === String(game.id)));
            const pageResults = filtered.slice((state.searchPage - 1) * 15, state.searchPage * 15);
            renderRawgSearchResults(pageResults);
          }
        } else if (state.activeTab === 'discover') {
          const trendingGrid = document.getElementById('discover-trending-grid');
          const upcomingGrid = document.getElementById('discover-upcoming-grid');
          const browseResultsGrid = document.getElementById('browse-results-grid');
          
          if (trendingGrid && state.trendingGamesBuffer) {
            const filtered = state.trendingGamesBuffer.filter(game => !state.localGames.some(g => String(g.id) === String(game.id)));
            const pageResults = filtered.slice((state.trendingPage - 1) * 15, state.trendingPage * 15);
            renderDiscoverResults(pageResults, trendingGrid);
          }
          if (upcomingGrid && state.upcomingGamesBuffer) {
            const filtered = state.upcomingGamesBuffer.filter(game => !state.localGames.some(g => String(g.id) === String(game.id)));
            const pageResults = filtered.slice((state.upcomingPage - 1) * 15, state.upcomingPage * 15);
            renderDiscoverResults(pageResults, upcomingGrid);
          }
          if (browseResultsGrid && state.browseGamesBuffer) {
            const filtered = state.browseGamesBuffer.filter(game => !state.localGames.some(g => String(g.id) === String(game.id)));
            const pageResults = filtered.slice((state.browsePage - 1) * 15, state.browsePage * 15);
            renderDiscoverResults(pageResults, browseResultsGrid);
          }
        }
      }
      closeModal();
    } else {
      showAlert('Lỗi', 'Lỗi khi cập nhật cơ sở dữ liệu!', 'error');
    }
  } else {
    closeModal();
  }
}

// Render Journal section in Modal
export function renderJournalSection(game) {
  if (!modalJournalSection || !journalSessionsList) return;

  modalJournalSection.style.display = 'block';
  journalSessionsList.innerHTML = '';

  const sessions = game.sessions || [];
  if (sessions.length === 0) {
    journalSessionsList.innerHTML = `
      <div style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 16px; border: 1.5px dashed var(--border-glass); border-radius: 8px; background: rgba(0,0,0,0.15);">
        Chưa có nhật ký chơi game nào được ghi nhận. Hãy nhấn nút "+ Thêm buổi chơi" để ghi lại buổi chơi đầu tiên của bạn!
      </div>
    `;
    return;
  }

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));

  journalSessionsList.innerHTML = sortedSessions.map((s, index) => {
    // Format date beautifully (DD/MM/YYYY)
    let formattedDate = s.date;
    try {
      const parts = s.date.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch(e) {}

    return `
      <div class="journal-session-card">
        <div class="session-left">
          <div class="session-meta-row">
            <span class="session-hours-badge">+${parseFloat(s.hours || 0).toFixed(1)}h</span>
            <span>Ngày chơi: <strong>${formattedDate}</strong></span>
          </div>
          <p class="session-notes">${s.notes ? s.notes.replace(/\r?\n/g, '<br>') : 'Không ghi chú.'}</p>
        </div>
        <button class="btn-delete-session" data-index="${index}" title="Xóa nhật ký chơi này">
          <svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    `;
  }).join('');

  // Bind delete session event listeners
  journalSessionsList.querySelectorAll('.btn-delete-session').forEach(btn => {
    btn.addEventListener('click', async () => {
      const sortedIdx = parseInt(btn.getAttribute('data-index'));
      const targetSession = sortedSessions[sortedIdx];
      
      // Find original index in game.sessions array
      const originalIdx = game.sessions.findIndex(s => s === targetSession);
      if (originalIdx !== -1) {
        const confirmDelete = await showConfirm('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa nhật ký buổi chơi này?');
        if (!confirmDelete) return;

        const removed = game.sessions.splice(originalIdx, 1)[0];

        // Deduct hours from total playing playtime
        game.playingHours = Math.max(0, parseFloat(game.playingHours || 0) - parseFloat(removed.hours || 0));
        game.updatedAt = Date.now();

        // Save
        const success = await saveGames(state.localGames);
        if (success) {
          // Update total hours field in modal input if present and game is currently in playing status
          if (inputPlayingHours && game.status === 'playing') {
            inputPlayingHours.value = game.playingHours.toFixed(1);
          }
          
          // Re-render journal
          renderJournalSection(game);
          
          // Update library and dashboard statistics
          updateLibraryStats();
          renderDashboard();
          
          // Refresh list tab if active
          if (state.activeTab !== 'discover' && state.activeTab !== 'search' && state.activeTab !== 'dashboard') {
            renderListTab(state.activeTab);
          }
        }
      }
    });
  });
}

// Bind Journal form events
if (btnToggleJournalForm) {
  btnToggleJournalForm.addEventListener('click', () => {
    if (journalAddForm.style.display === 'none') {
      journalAddForm.style.display = 'block';
      inputSessionDate.value = new Date().toISOString().split('T')[0];
      inputSessionHours.value = '1.0';
      inputSessionNotes.value = '';
      btnToggleJournalForm.textContent = 'Đóng form';
      inputSessionNotes.focus();
    } else {
      journalAddForm.style.display = 'none';
      btnToggleJournalForm.textContent = '+ Thêm buổi chơi';
    }
  });
}

if (btnCancelSession) {
  btnCancelSession.addEventListener('click', () => {
    journalAddForm.style.display = 'none';
    if (btnToggleJournalForm) btnToggleJournalForm.textContent = '+ Thêm buổi chơi';
  });
}

if (btnSaveSession) {
  btnSaveSession.addEventListener('click', async () => {
    if (!state.selectedGame) return;
    const game = state.localGames.find(g => g.id === state.selectedGame.id);
    if (!game) {
      showAlert('Thông báo', 'Vui lòng lưu game vào thư viện trước khi ghi nhận nhật ký buổi chơi!', 'info');
      return;
    }

    const dateVal = inputSessionDate.value || new Date().toISOString().split('T')[0];
    const hoursVal = parseFloat(inputSessionHours.value) || 0;
    const notesVal = inputSessionNotes.value.trim();

    if (hoursVal <= 0) {
      showAlert('Cảnh báo', 'Số giờ chơi phải lớn hơn 0!', 'error');
      return;
    }

    // Initialize sessions array if not present
    game.sessions = game.sessions || [];
    game.sessions.push({
      date: dateVal,
      hours: hoursVal,
      notes: notesVal
    });

    // Accumulate total playtime
    game.playingHours = parseFloat(game.playingHours || 0) + hoursVal;
    game.updatedAt = Date.now();

    // If game is in backlog, automatically transition to playing
    if (game.status === 'backlog') {
      game.status = 'playing';
      game.startDate = dateVal;
      if (selectGameStatus) selectGameStatus.value = 'playing';
      updateModalFieldsVisibility('playing');
    }

    // Save
    const success = await saveGames(state.localGames);
    if (success) {
      // Hide form
      journalAddForm.style.display = 'none';
      if (btnToggleJournalForm) btnToggleJournalForm.textContent = '+ Thêm buổi chơi';

      // Update total hours field in modal input if present and game is currently in playing status
      if (inputPlayingHours && game.status === 'playing') {
        inputPlayingHours.value = game.playingHours.toFixed(1);
      }

      // Re-render journal
      renderJournalSection(game);

      // Update library and dashboard statistics
      updateLibraryStats();
      renderDashboard();

      // Refresh list tab if active
      if (state.activeTab !== 'discover' && state.activeTab !== 'search' && state.activeTab !== 'dashboard') {
        renderListTab(state.activeTab);
      }
    } else {
      showAlert('Lỗi', 'Lỗi khi lưu nhật ký chơi game!', 'error');
    }
  });
}

