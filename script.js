
const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");
const transactionList = document.getElementById("transaction-list");
const emptyMessage = document.getElementById("empty-message");
const transactionCount = document.getElementById("transaction-count");

const STORAGE_KEY = "expenseTrackerTransactions";
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR"
});

let transactions = [];

try {
  const savedData = localStorage.getItem(STORAGE_KEY);
  const parsedData = savedData ? JSON.parse(savedData) : [];

  if (Array.isArray(parsedData)) {
    transactions = parsedData.filter(item =>
      item &&
      typeof item.id === "string" &&
      typeof item.description === "string" &&
      Number.isFinite(item.amount) &&
      item.amount > 0 &&
      ["income", "expense"].includes(item.type) &&
      typeof item.date === "string"
    );
  }
} catch (error) {
  transactions = [];
}

function formatMoney(amount) {
  return currency.format(amount);
}

function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    alert("Could not save data in this browser.");
  }
}

function updateSummary() {
  const income = transactions
    .filter(item => item.type === "income")
    .reduce((total, item) => total + item.amount, 0);

  const expenses = transactions
    .filter(item => item.type === "expense")
    .reduce((total, item) => total + item.amount, 0);

  balanceElement.textContent = formatMoney(income - expenses);
  incomeElement.textContent = formatMoney(income);
  expenseElement.textContent = formatMoney(expenses);

  transactionCount.textContent =
    `${transactions.length} ${transactions.length === 1 ? "record" : "records"}`;

  emptyMessage.style.display =
    transactions.length === 0 ? "block" : "none";
}

function renderTransactions() {
  transactionList.replaceChildren();

  const sortedTransactions = [...transactions].reverse();

  sortedTransactions.forEach(item => {
    const li = document.createElement("li");
    li.className = "transaction";

    const info = document.createElement("div");
    info.className = "transaction-info";

    const title = document.createElement("h3");
    title.textContent = item.description;

    const date = document.createElement("p");
    date.textContent = item.date;

    info.append(title, date);

    const right = document.createElement("div");
    right.className = "transaction-right";

    const amount = document.createElement("span");
    amount.className = "transaction-amount " +
      (item.type === "income" ? "amount-income" : "amount-expense");

    amount.textContent =
      `${item.type === "income" ? "+" : "-"}${formatMoney(item.amount)}`;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute(
      "aria-label",
      `Delete transaction: ${item.description}`
    );

    deleteButton.addEventListener("click", () => {
      transactions = transactions.filter(tx => tx.id !== item.id);
      saveTransactions();
      renderTransactions();
      updateSummary();
    });

    right.append(amount, deleteButton);
    li.append(info, right);
    transactionList.appendChild(li);
  });

  updateSummary();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;

  if (
    !description ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !["income", "expense"].includes(type)
  ) {
    alert("Please enter a valid description and amount.");
    return;
  }

  const transaction = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    description,
    amount: Math.round(amount * 100) / 100,
    type,
    date: new Date().toLocaleDateString("en-IN")
  };

  transactions.push(transaction);
  saveTransactions();

  form.reset();
  descriptionInput.focus();

  renderTransactions();
});

renderTransactions();
    
