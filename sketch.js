const incomeTypes = ["NET", "GROSS"]
const dtiCoeffcient = 45;
const yashayishMin = 246;
const categories = ["MBNP", "Əlavə"]
const sectors = ["Neft/Qaz və Dövlət", "Qeyri Neft/Qaz və Özəl"]
let bgnModalIsShown = false;

document.getElementById("bgnCalculatorModal").addEventListener('show.bs.modal', event => {
  bgnModalIsShown = true
  const toastElList = document.querySelectorAll('.toast')
  toastElList.forEach(toastEl => {
    const t = new bootstrap.Toast(toastEl)
    t.hide();
  })
})

document.getElementById("bgnCalculatorModal").addEventListener('hide.bs.modal', event => {
  bgnModalIsShown = false
})

const bgn = new Vue({
  el: "#bgnCalculator",
  data() {
    return {
      income: 10000,
      incomeType: 0,
      familyCount: 1,
      interestRate: 18,
      sector: 0,
      term: 24,
      gracePeriod: 0,
      modal: false,
      tags: [
        {
          id: 0,
          title: "Anuniet",
          category: 0,
          isActive: 1,
          computed: 'anuniet',
          hide: null
        },
        {
          id: 1,
          title: "Kredit",
          category: 0,
          isActive: 1,
          computed: 'calcCredit',
          hide: null
        },
        {
          id: 2,
          title: "Gəlir vergisi",
          category: 1,
          isActive: 0,
          computed: 'gelirVergisi',
          hide: null
        },
        {
          id: 3,
          title: "İcbari tibbi sığorta",
          category: 1,
          isActive: 0,
          computed: 'icbari',
          hide: null
        },
        {
          id: 4,
          title: "Sosial sığorta",
          category: 1,
          isActive: 0,
          computed: 'sosialSigorta',
          hide: null
        },
        {
          id: 5,
          title: "İşsizlik sığortası",
          category: 1,
          isActive: 0,
          computed: 'unemployment',
          hide: null
        },
        {
          id: 6,
          title: "Hesablanmış yekun ə.h",
          category: 1,
          isActive: 0,
          computed: 'calcIncome',
          hide: null
        },
        {
          id: 7,
          title: "Aylıq faiz dərəcəsi",
          category: 1,
          isActive: 0,
          computed: 'monthlyInterestRate',
          hide: null
        },
        {
          id: 8,
          title: "Anuniet əmsalı",
          category: 1,
          isActive: 0,
          computed: 'anunietCoefficent',
          hide: null
        },
      ],
    }
  },

  methods: {
    percentage(value, percent) {
      return value * percent / 100;
    },

    excelFloor(number, decimals) {
      decimals = decimals || 0;
      return (Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals));
    },

    toast(id, index) {
      if(bgnModalIsShown) return;
      const alert = document.createElement('span');
      alert.id = 'bgnCalculatorAlert';
      alert.classList = 'position-absolute top-1 start-100 translate-middle p-2 bg-danger border border-light rounded-circle';
      alertElement = document.getElementById(alert.id)

      if(!alertElement)
        document.getElementById('openBgnModal').append(alert);
      
      alertElement?.addEventListener("animationend", () => alertElement.remove())
      
      const el = document.getElementById(id)
      const toast = new bootstrap.Toast(el, { autohide: false })
      const sectorInfo = new bootstrap.Toast(document.getElementById("sectorInfo"))
      clearInterval(this.tags[index].hide)

      if(!sectorInfo.isShown()) {
        sectorInfo.show()
      }

      if (!toast.isShown()) {
        toast.show();
      }
      
      this.tags[index].hide = setTimeout(() => {
        toast.hide()
      }, 5000)

    },

    eval(instance) {
      return Number(this[instance]).toFixed(2)
    },

    hideCalc(id) {
      const index = this.tags.findIndex(t => t.id == id);
      this.$set(this.tags[index], "isActive", 0)
    }
  },

  watch: {
    calcCredit(newValue) {
      this.toast("calcCredit", 0)
    },

    anuniet(newValue) {
      this.toast("anuniet", 1)
    }
  },

  computed: {
    getSectors() {
      return sectors;
    },

    getIncomeType() {
      return incomeTypes;
    },

    getDTI() {
      return `DTİ əmsalı: ${dtiCoeffcient}%`;
    },

    mainTags() {
      return this.tags.filter(t => t.category == 0)
    },

    otherTags() {
      return this.tags.filter(t => t.category == 1)
    },

    aviableTags() {
      return this.tags.filter(t => t.isActive && (t.category || t.computed == 'anuniet'))
    },

    getYasayishMin() {
      return `Yaşayış minimumu: ${yashayishMin} ₼`;
    },

    gelirVergisi() {
      if (this.incomeType == 0) return 0;
      return this.sector == 1 ? (this.income <= 8000 ? 0 : this.percentage(this.income - 8000, 14)) :
        this.income <= 200 ? 0 :
          (this.income <= 2500 ? this.percentage(this.income - 200, 14) : this.percentage(this.income - 2500, 25) + 350);
    },

    sosialSigorta() {
      if (this.incomeType == 0) return 0;

      return this.sector == 1 ? (this.income <= 200 ? this.percentage(this.income, 3) : this.percentage(this.income - 200, 10) + 6) :
        this.percentage(this.income, 3);
    },

    icbari() {
      if (this.incomeType == 0) return 0;

      return this.income <= 8000 ? this.percentage(this.income, 2) : this.percentage(this.income - 8000, 0.5) + 160;
    },

    unemployment() {
      if (this.incomeType == 0) return 0;
      return this.percentage(this.income, 0.5)
    },

    grossToNet() {
      return this.income - (this.sosialSigorta + this.icbari + this.gelirVergisi + this.unemployment)
    },

    calcIncome() {
      return this.incomeType === 1 ? this.grossToNet : this.income;
    },

    anuniet() {
      return this.percentage(this.calcIncome, dtiCoeffcient)
    },

    aktivKeyfiyyetTelebi() {
      return (this.calcIncome - this.anuniet) > yashayishMin;
    },

    maxAnuniet() {
      return !this.aktivKeyfiyyetTelebi ? this.calcIncome - yashayishMin : this.anuniet
    },

    monthlyInterestRate() {
      return (this.interestRate / 100) / 12;
    },

    anunietCoefficent() {
      return (this.monthlyInterestRate * Math.pow(1 + this.monthlyInterestRate, (this.term) - this.gracePeriod) /
        (Math.pow(1 + this.monthlyInterestRate, (this.term) - this.gracePeriod) - 1));
    },

    yeniMaxKredit() {
      return this.maxAnuniet / this.anunietCoefficent;
    },

    calcCredit() {
      return this.excelFloor(this.yeniMaxKredit > 0 ? this.yeniMaxKredit : 0, -1);
    }
  }
})


const app = new Vue({
  el: "#app",
  data() {
    return {
      income: 10000,
      sector: 0,
      incomeType: 0,
      familyCount: 1,
      interestRate: 18,
      sector: 0,
      term: 24,
      gracePeriod: 0,
      bgn
    }
  },

  computed: {
    getSectors() {
      return sectors;
    },

    getIncomeType() {
      return incomeTypes;
    },
  },

  watch: {
    income(newValue) {
      bgn.income = newValue
    },
    interestRate(newValue) {
      bgn.interestRate = newValue
    },
    term(newValue) {
      bgn.term = newValue
    },
    familyCount(newValue) {
      bgn.familyCount = newValue
    },
    sector(newValue) {
      bgn.sector = newValue
    },
    incomeType(newValue) {
      bgn.incomeType = newValue
    }
  }
})