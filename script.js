let selectedDate = new Date();
let calendarDate = new Date();

let schedules =
  JSON.parse(localStorage.getItem("schedules")) || {};

let weeklySchedules =
  JSON.parse(localStorage.getItem("weeklySchedules")) || [];

let weeklyDone =
  JSON.parse(localStorage.getItem("weeklyDone")) || {};

let totalScore =
  Number(localStorage.getItem("totalScore")) || 0;

let editingWeeklyIndex = null;
let editingDailyIndex = null;


/* =========================
   تنظیمات
========================= */

const weekDays = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه"
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const monthNamesFa = [
  "ژانویه",
  "فوریه",
  "مارس",
  "آوریل",
  "مه",
  "ژوئن",
  "ژوئیه",
  "اوت",
  "سپتامبر",
  "اکتبر",
  "نوامبر",
  "دسامبر"
];

const typeInfo = {
  lesson: {
    title: "درس",
    icon: "📘",
    points: 5
  },

  homework: {
    title: "تکلیف",
    icon: "📝",
    points: 10
  },

  exam: {
    title: "امتحان",
    icon: "🧪",
    points: 20
  }
};


/* =========================
   تاریخ
========================= */

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}


function formatDate(date) {
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });
}


function isSameDay(a, b) {
  return dateKey(a) === dateKey(b);
}


/* =========================
   ذخیره
========================= */

function saveData() {

  localStorage.setItem(
    "schedules",
    JSON.stringify(schedules)
  );

  localStorage.setItem(
    "weeklySchedules",
    JSON.stringify(weeklySchedules)
  );

  localStorage.setItem(
    "weeklyDone",
    JSON.stringify(weeklyDone)
  );

  localStorage.setItem(
    "totalScore",
    String(totalScore)
  );
}


/* =========================
   برنامه‌های روزانه
========================= */

function getDailySchedules(date) {

  const key = dateKey(date);

  if (!schedules[key]) {
    schedules[key] = [];
  }

  return schedules[key];
}


function saveDailySchedule(event) {

  event.preventDefault();

  const title =
    document.getElementById("dailyTitle").value.trim();

  const time =
    document.getElementById("dailyTime").value;

  const type =
    document.getElementById("dailyType").value;

  const reminder =
    document.getElementById("dailyReminder").value;

  const reminderEnabled =
    document.getElementById("dailyReminderEnabled").checked;

  if (!title || !time) {
    return;
  }

  const key = dateKey(selectedDate);

  if (!schedules[key]) {
    schedules[key] = [];
  }

  const program = {
    id:
      Date.now().toString() +
      Math.random().toString(16).slice(2),

    title,
    time,
    type,
    reminder,
    reminderEnabled,
    completed: false
  };


  if (editingDailyIndex !== null) {

    const oldProgram =
      schedules[key][editingDailyIndex];

    program.id = oldProgram.id;
    program.completed = oldProgram.completed;

    schedules[key][editingDailyIndex] = program;

    editingDailyIndex = null;

  } else {

    schedules[key].push(program);

  }


  schedules[key].sort((a, b) =>
    a.time.localeCompare(b.time)
  );

  saveData();

  resetDailyForm();

  renderAll();
}


function editDaily(index) {

  const list =
    getDailySchedules(selectedDate);

  const item = list[index];

  document.getElementById("dailyTitle").value =
    item.title;

  document.getElementById("dailyTime").value =
    item.time;

  document.getElementById("dailyType").value =
    item.type;

  document.getElementById("dailyReminder").value =
    item.reminder || "";

  document.getElementById("dailyReminderEnabled").checked =
    item.reminderEnabled !== false;

  editingDailyIndex = index;

  document.getElementById("dailySaveButton").textContent =
    "💾 ذخیره تغییرات";

  document.getElementById("dailyCancelButton").style.display =
    "block";

  document.getElementById("dailyTitle")
    .scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
}


function cancelDailyEdit() {

  editingDailyIndex = null;

  resetDailyForm();
}


function resetDailyForm() {

  document.getElementById("dailyForm").reset();

  document.getElementById("dailyReminderEnabled").checked =
    true;

  document.getElementById("dailySaveButton").textContent =
    "➕ افزودن برنامه";

  document.getElementById("dailyCancelButton").style.display =
    "none";
}


function deleteDaily(index) {

  const key = dateKey(selectedDate);

  if (!schedules[key]) return;

  const item = schedules[key][index];

  if (item.completed) {

    totalScore -=
      typeInfo[item.type]?.points || 0;

    if (totalScore < 0) {
      totalScore = 0;
    }
  }

  schedules[key].splice(index, 1);

  saveData();

  renderAll();
}


function toggleDaily(index) {

  const key = dateKey(selectedDate);

  const item = schedules[key][index];

  const points =
    typeInfo[item.type]?.points || 0;

  if (!item.completed) {

    item.completed = true;
    totalScore += points;

  } else {

    item.completed = false;
    totalScore -= points;

    if (totalScore < 0) {
      totalScore = 0;
    }
  }

  saveData();

  renderAll();
}


/* =========================
   برنامه‌های هفتگی
========================= */

function addWeeklySchedule(event) {

  event.preventDefault();

  const title =
    document.getElementById("weeklyTitle").value.trim();

  const day =
    Number(document.getElementById("weeklyDay").value);

  const time =
    document.getElementById("weeklyTime").value;

  const type =
    document.getElementById("weeklyType").value;

  const reminder =
    document.getElementById("weeklyReminder").value;

  const reminderEnabled =
    document.getElementById("weeklyReminderEnabled").checked;


  if (!title || !time) {
    return;
  }


  const program = {

    title,
    day,
    time,
    type,
    reminder,
    reminderEnabled,

    id:
      Date.now().toString() +
      Math.random().toString(16).slice(2)
  };


  if (editingWeeklyIndex !== null) {

    program.id =
      weeklySchedules[editingWeeklyIndex].id;

    weeklySchedules[editingWeeklyIndex] =
      program;

    editingWeeklyIndex = null;

  } else {

    weeklySchedules.push(program);

  }


  weeklySchedules.sort((a, b) => {

    if (a.day !== b.day) {
      return a.day - b.day;
    }

    return a.time.localeCompare(b.time);

  });


  saveData();

  resetWeeklyForm();

  renderAll();
}


function editWeekly(index) {

  const item =
    weeklySchedules[index];

  document.getElementById("weeklyTitle").value =
    item.title;

  document.getElementById("weeklyDay").value =
    item.day;

  document.getElementById("weeklyTime").value =
    item.time;

  document.getElementById("weeklyType").value =
    item.type;

  document.getElementById("weeklyReminder").value =
    item.reminder || "";

  document.getElementById("weeklyReminderEnabled").checked =
    item.reminderEnabled !== false;

  editingWeeklyIndex = index;

  document.getElementById("weeklySaveButton").textContent =
    "💾 ذخیره تغییرات";

  document.getElementById("weeklyCancelButton").style.display =
    "block";

  document.getElementById("weeklyTitle")
    .scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
}


function cancelWeeklyEdit() {

  editingWeeklyIndex = null;

  resetWeeklyForm();
}


function resetWeeklyForm() {

  document.getElementById("weeklyForm").reset();

  document.getElementById("weeklyReminderEnabled").checked =
    true;

  document.getElementById("weeklySaveButton").textContent =
    "➕ افزودن برنامه هفتگی";

  document.getElementById("weeklyCancelButton").style.display =
    "none";
}


function deleteWeekly(index) {

  const item =
    weeklySchedules[index];

  if (item) {

    Object.keys(weeklyDone).forEach(key => {

      if (key.includes(item.id)) {

        delete weeklyDone[key];

      }

    });

  }

  weeklySchedules.splice(index, 1);

  saveData();

  renderAll();
}


function weeklyInstanceKey(program, date) {

  return `${dateKey(date)}_${program.id}`;
}


function isWeeklyDone(program, date) {

  return !!weeklyDone[
    weeklyInstanceKey(program, date)
  ];
}


function toggleWeekly(program, date) {

  const key =
    weeklyInstanceKey(program, date);

  if (weeklyDone[key]) {

    delete weeklyDone[key];

    totalScore -=
      typeInfo[program.type]?.points || 0;

    if (totalScore < 0) {
      totalScore = 0;
    }

  } else {

    weeklyDone[key] = true;

    totalScore +=
      typeInfo[program.type]?.points || 0;
  }

  saveData();

  renderAll();
}


/* =========================
   نمایش برنامه روز
========================= */

function renderDailySchedules() {

  const container =
    document.getElementById("dailySchedules");

  const list =
    getDailySchedules(selectedDate);

  const weeklyForDay =
    weeklySchedules
      .filter(item =>
        item.day === selectedDate.getDay()
      )
      .map(item => ({
        ...item,
        weekly: true
      }));


  const allPrograms = [

    ...list.map(item => ({
      ...item,
      weekly: false
    })),

    ...weeklyForDay

  ];


  allPrograms.sort((a, b) =>
    a.time.localeCompare(b.time)
  );


  document.getElementById("dailyCount").textContent =
    `${allPrograms.length} برنامه`;


  if (allPrograms.length === 0) {

    container.innerHTML = `
      <div class="empty-message">
        برای این روز برنامه‌ای ثبت نشده است.
      </div>
    `;

    return;
  }


  container.innerHTML = "";


  allPrograms.forEach(program => {

    const realIndex =
      list.indexOf(program);


    const completed =
      program.weekly
        ? isWeeklyDone(program, selectedDate)
        : program.completed;


    const info =
      typeInfo[program.type] ||
      typeInfo.lesson;


    const item =
      document.createElement("div");

    item.className =
      "schedule-item" +
      (completed
        ? " schedule-completed"
        : "");


    item.innerHTML = `

      <div class="schedule-main">

        <input
          class="schedule-check"
          type="checkbox"
          ${completed ? "checked" : ""}
          aria-label="انجام شد"
        >

        <div class="schedule-content">

          <div class="schedule-title">
            ${escapeHtml(program.title)}
          </div>

          <div class="schedule-time">
            ⏰ ${program.time}
          </div>

          <span class="schedule-type">
            ${info.icon}
            ${info.title}
            -
            ${info.points}
            امتیاز
          </span>

        </div>

      </div>

      <div class="schedule-actions"></div>
    `;


    const checkbox =
      item.querySelector(".schedule-check");


    checkbox.addEventListener(
      "change",
      () => {

        if (program.weekly) {

          toggleWeekly(
            program,
            selectedDate
          );

        } else {

          toggleDaily(realIndex);

        }

      }
    );


    const actions =
      item.querySelector(".schedule-actions");


    if (!program.weekly) {

      const editButton =
        document.createElement("button");

      editButton.className =
        "small-button edit-button";

      editButton.textContent =
        "✏️ ویرایش";

      editButton.onclick = () =>
        editDaily(realIndex);


      const deleteButton =
        document.createElement("button");

      deleteButton.className =
        "small-button delete-button";

      deleteButton.textContent =
        "🗑 حذف";

      deleteButton.onclick = () =>
        deleteDaily(realIndex);


      actions.appendChild(editButton);
      actions.appendChild(deleteButton);

    } else {

      const weeklyLabel =
        document.createElement("span");

      weeklyLabel.className =
        "weekly-done";

      weeklyLabel.textContent =
        "🔁 برنامه هفتگی";

      actions.appendChild(weeklyLabel);

    }


    container.appendChild(item);

  });

}


/* =========================
   نمایش برنامه‌های هفتگی
========================= */

function renderWeeklySchedules() {

  const container =
    document.getElementById("weeklySchedules");


  if (weeklySchedules.length === 0) {

    container.innerHTML = `
      <div class="empty-message">
        هنوز برنامه هفتگی ثبت نشده است.
      </div>
    `;

    return;
  }


  container.innerHTML = "";


  weeklySchedules.forEach((item, index) => {

    const div =
      document.createElement("div");

    div.className =
      "weekly-item";


    const info =
      typeInfo[item.type] ||
      typeInfo.lesson;


    div.innerHTML = `

      <div class="weekly-header">

        <div>

          <div class="weekly-title">
            ${info.icon}
            ${escapeHtml(item.title)}
          </div>

          <div class="weekly-info">

            ${weekDays[item.day]}
            •
            ${item.time}
            •
            ${info.points} امتیاز

          </div>

          ${
            item.reminder
              ? `<div class="weekly-info">
                   🔔 یادآوری: ${item.reminder}
                 </div>`
              : ""
          }

        </div>

      </div>

      <div class="weekly-actions">

        <button
          class="small-button edit-button"
        >
          ✏️ ویرایش
        </button>

        <button
          class="small-button delete-button"
        >
          🗑 حذف
        </button>

      </div>
    `;


    div.querySelector(".edit-button")
      .onclick = () =>
        editWeekly(index);


    div.querySelector(".delete-button")
      .onclick = () =>
        deleteWeekly(index);


    container.appendChild(div);

  });

}


/* =========================
   امتیاز
========================= */

function calculateTodayScore() {

  let score = 0;


  const daily =
    getDailySchedules(selectedDate);


  daily.forEach(item => {

    if (item.completed) {

      score +=
        typeInfo[item.type]?.points || 0;

    }

  });


  weeklySchedules
    .filter(item =>
      item.day === selectedDate.getDay()
    )
    .forEach(item => {

      if (isWeeklyDone(item, selectedDate)) {

        score +=
          typeInfo[item.type]?.points || 0;

      }

    });


  return score;
}


function renderScore() {

  const score =
    calculateTodayScore();


  document.getElementById("todayScore")
    .textContent = score;


  let message =
    "برنامه‌هایت را انجام بده و امتیاز بگیر!";


  if (score >= 50) {
    message =
      "عالی! امروز خیلی خوب پیش رفتی 💪";
  } else if (score >= 20) {
    message =
      "خوبه! ادامه بده 🔥";
  } else if (score > 0) {
    message =
      "شروع خوبی داشتی 👏";
  }


  document.getElementById("scoreMessage")
    .textContent = message;


  renderLevel();
}


function renderLevel() {

  let name = "شروع کننده";
  let icon = "🌱";
  let next = 50;


  if (totalScore >= 500) {

    name = "قهرمان";
    icon = "🏆";
    next = null;

  } else if (totalScore >= 300) {

    name = "حرفه‌ای";
    icon = "🥇";
    next = 500;

  } else if (totalScore >= 150) {

    name = "پرتلاش";
    icon = "🔥";
    next = 300;

  } else if (totalScore >= 50) {

    name = "منظم";
    icon = "💪";
    next = 150;
  }


  document.getElementById("levelName")
    .textContent = name;

  document.getElementById("levelIcon")
    .textContent = icon;


  if (next === null) {

    document.getElementById("levelProgress")
      .textContent =
      `امتیاز کل: ${totalScore} — بالاترین سطح`;

  } else {

    document.getElementById("levelProgress")
      .textContent =
      `امتیاز کل: ${totalScore} — ${next - totalScore} امتیاز تا سطح بعدی`;

  }

}


/* =========================
   تقویم
========================= */

function renderCalendar() {

  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();


  document.getElementById("calendarMonth")
    .textContent =
      `${monthNames[month]} ${year}`;


  document.getElementById("calendarMonthPersian")
    .textContent =
      monthNamesFa[month];


  const container =
    document.getElementById("calendarDays");

  container.innerHTML = "";


  const firstDay =
    new Date(year, month, 1).getDay();


  const daysInMonth =
    new Date(year, month + 1, 0).getDate();


  for (let i = 0; i < firstDay; i++) {

    const empty =
      document.createElement("div");

    empty.className =
      "calendar-day empty";

    container.appendChild(empty);
  }


  for (let day = 1; day <= daysInMonth; day++) {

    const date =
      new Date(year, month, day);

    const key =
      dateKey(date);


    const daily =
      schedules[key] || [];


    const weekly =
      weeklySchedules.filter(item =>
        item.day === date.getDay()
      );


    const hasPrograms =
      daily.length > 0 ||
      weekly.length > 0;


    const dailyCompleted =
      daily.length > 0 &&
      daily.every(item =>
        item.completed
      );


    const weeklyCompleted =
      weekly.length > 0 &&
      weekly.every(item =>
        isWeeklyDone(item, date)
      );


    const allCompleted =
      hasPrograms &&
      dailyCompleted &&
      weeklyCompleted;


    const div =
      document.createElement("div");

    div.className =
      "calendar-day";


    if (hasPrograms) {
      div.classList.add("planned");
    }


    if (allCompleted) {
      div.classList.add("completed");
    }


    if (isSameDay(date, new Date())) {
      div.classList.add("today");
    }


    if (isSameDay(date, selectedDate)) {
      div.classList.add("selected");
    }


    div.innerHTML = `

      <span class="calendar-day-number">
        ${day}
      </span>

      ${
        hasPrograms
          ? `<span class="calendar-mark">●</span>`
          : ""
      }

    `;


    div.onclick = () => {

      selectedDate =
        new Date(year, month, day);

      renderAll();

      document
        .getElementById("selectedDate")
        .scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

    };


    container.appendChild(div);

  }

}


function changeMonth(amount) {

  calendarDate.setMonth(
    calendarDate.getMonth() + amount
  );

  renderCalendar();
}


function changeDay(amount) {

  selectedDate.setDate(
    selectedDate.getDate() + amount
  );

  calendarDate =
    new Date(selectedDate);

  renderAll();
}


function goToday() {

  selectedDate =
    new Date();

  calendarDate =
    new Date();

  renderAll();
}


/* =========================
   یادآوری
========================= */

function getReminderItems() {

  const result = [];


  Object.keys(schedules).forEach(key => {

    schedules[key].forEach(item => {

      if (
        item.reminder &&
        item.reminderEnabled !== false
      ) {

        result.push({

          date: key,
          title: item.title,
          time: item.reminder,
          type: "روزانه"

        });

      }

    });

  });


  weeklySchedules.forEach(item => {

    if (
      item.reminder &&
      item.reminderEnabled !== false
    ) {

      result.push({

        date: null,
        title: item.title,
        time: item.reminder,
        type:
          `هفتگی - ${weekDays[item.day]}`

      });

    }

  });


  result.sort((a, b) =>
    a.time.localeCompare(b.time)
  );


  return result;
}


function renderReminders() {

  const container =
    document.getElementById("reminders");


  const items =
    getReminderItems();


  if (items.length === 0) {

    container.innerHTML = `
      <div class="empty-message">
        هنوز یادآوری ثبت نشده است.
      </div>
    `;

    return;
  }


  container.innerHTML = "";


  items.forEach(item => {

    const div =
      document.createElement("div");

    div.className =
      "reminder-item";


    div.innerHTML = `

      <div class="reminder-time">
        ⏰ ${item.time}
      </div>

      <div class="reminder-title">
        ${escapeHtml(item.title)}
      </div>

      <div class="reminder-info">
        ${item.type}
      </div>

    `;


    container.appendChild(div);

  });

}


/* =========================
   اعلان مرورگر
========================= */

async function enableNotifications() {

  if (!("Notification" in window)) {

    alert(
      "این مرورگر از اعلان‌ها پشتیبانی نمی‌کند."
    );

    return;
  }


  const permission =
    await Notification.requestPermission();


  updateNotificationStatus();


  if (permission === "granted") {

    new Notification(
      "🔔 اعلان‌ها فعال شدند",
      {
        body:
          "از این به بعد یادآوری برنامه‌ها را دریافت می‌کنی."
      }
    );


    alert(
      "اعلان‌ها با موفقیت فعال شدند ✅"
    );

  } else {

    alert(
      "اجازه اعلان داده نشد."
    );

  }

}


function updateNotificationStatus() {

  const status =
    document.getElementById(
      "notificationStatus"
    );


  if (!("Notification" in window)) {

    status.textContent =
      "پشتیبانی نمی‌شود";

    return;
  }


  const permission =
    Notification.permission;


  if (permission === "granted") {

    status.textContent =
      "فعال ✅";

  } else if (permission === "denied") {

    status.textContent =
      "مسدود شده ❌";

  } else {

    status.textContent =
      "فعال نشده";

  }

}


/* =========================
   سیستم بررسی یادآوری
========================= */

const sentReminders =
  new Set();


function checkReminders() {

  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }


  const now =
    new Date();


  const currentTime =
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;


  const todayKey =
    dateKey(now);


  const todayPrograms =
    schedules[todayKey] || [];


  todayPrograms.forEach(item => {

    if (
      item.reminder &&
      item.reminderEnabled !== false &&
      item.reminder === currentTime
    ) {

      const uniqueKey =
        `daily_${todayKey}_${item.id}_${currentTime}`;


      if (!sentReminders.has(uniqueKey)) {

        sentReminders.add(uniqueKey);


        new Notification(
          "⏰ وقت برنامه است!",
          {
            body:
              `وقت ${item.title} است!`,
            tag: uniqueKey
          }
        );

      }

    }

  });


  weeklySchedules.forEach(item => {

    if (
      item.day === now.getDay() &&
      item.reminder &&
      item.reminderEnabled !== false &&
      item.reminder === currentTime
    ) {

      const uniqueKey =
        `weekly_${todayKey}_${item.id}_${currentTime}`;


      if (!sentReminders.has(uniqueKey)) {

        sentReminders.add(uniqueKey);


        new Notification(
          "⏰ یادآوری برنامه هفتگی",
          {
            body:
              `وقت ${item.title} است!`,
            tag: uniqueKey
          }
        );

      }

    }

  });

}


/* هر 10 ثانیه بررسی می‌کند */

setInterval(
  checkReminders,
  10000
);


/* =========================
   امنیت نمایش متن
========================= */

function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;
}


/* =========================
   نمایش تاریخ انتخاب‌شده
========================= */

function renderSelectedDate() {

  document.getElementById(
    "selectedDate"
  ).textContent =
    formatDate(selectedDate);

}


/* =========================
   نمایش همه قسمت‌ها
========================= */

function renderAll() {

  renderSelectedDate();

  renderCalendar();

  renderDailySchedules();

  renderWeeklySchedules();

  renderScore();

  renderReminders();

  updateNotificationStatus();

}


/* =========================
   شروع برنامه
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderAll();

  }
);
