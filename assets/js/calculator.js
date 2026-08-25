/* ==========================================================================
   مؤسسة حدائق الجنة - Interactive Cost Calculator Engine
   ========================================================================== */

// كائن لحفظ بيانات مدخلات العميل
const calcData = {
    area: 0,
    grassType: '',
    addons: [],
    addonsTotalPrice: 0,
    finishLevel: '',
    totalEstimate: 0
};

let currentStep = 1;
const totalSteps = 5;

// التنقل للخطوة التالية
function nextStep() {
    // التحقق من إدخال المساحة في الخطوة الأولى
    if (currentStep === 1) {
        const areaInput = document.getElementById('calc-area');
        const areaVal = parseFloat(areaInput.value);
        if (!areaVal || areaVal <= 0) {
            alert('يرجى إدخال مساحة صحيحة بالمتر المربع.');
            return;
        }
        calcData.area = areaVal;
    }

    // جمع الخدمات الإضافية في الخطوة الثالثة
    if (currentStep === 3) {
        const selectedAddons = document.querySelectorAll('input[name="addons"]:checked');
        calcData.addons = [];
        calcData.addonsTotalPrice = 0;
        
        selectedAddons.forEach(addon => {
            calcData.addons.push(addon.value);
            calcData.addonsTotalPrice += parseFloat(addon.getAttribute('data-price')) || 0;
        });
    }

    if (currentStep < totalSteps) {
        currentStep++;
        updateCalculatorUI();
    }

    // إذا وصلنا لخطوة النتيجة الناتجة
    if (currentStep === 5) {
        calculateTotal();
    }
}

// العودة للخطوة السابقة
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateCalculatorUI();
    }
}

// تحديث الواجهة وشريط التقدم
function updateCalculatorUI() {
    // تحديث شريط التقدم
    const progressBar = document.getElementById('calc-progress');
    if (progressBar) {
        const percentage = (currentStep / totalSteps) * 100;
        progressBar.style.width = percentage + '%';
    }

    // إخفاء وإظهار الخطوات
    const steps = document.querySelectorAll('.calc-step');
    steps.forEach(step => {
        step.classList.remove('active');
        if (parseInt(step.getAttribute('data-step')) === currentStep) {
            step.classList.add('active');
        }
    });
}

// حساب التكلفة التقديرية النهائية
function calculateTotal() {
    let grassPricePerMeter = 0;
    
    // تحديد سعر العشب لكل متر
    switch (calcData.grassType) {
        case 'economic':
            grassPricePerMeter = 30;
            break;
        case 'premium':
            grassPricePerMeter = 45;
            break;
        case 'luxury':
            grassPricePerMeter = 65;
            break;
        default:
            grassPricePerMeter = 35;
    }

    // تحديد معامل نوع التشطيب
    let finishMultiplier = 1;
    if (calcData.finishLevel === 'medium') finishMultiplier = 1.2;
    if (calcData.finishLevel === 'luxury') finishMultiplier = 1.5;

    // الحساب النهائي: (سعر العشب + الإضافات) * المساحة * معامل التشطيب
    const baseCostPerMeter = grassPricePerMeter + calcData.addonsTotalPrice;
    calcData.totalEstimate = Math.round(baseCostPerMeter * calcData.area * finishMultiplier);

    renderResultView();
}

// عرض النتيجة النهائية مع زر الإرسال عبر الواتساب
function renderResultView() {
    const resultContainer = document.getElementById('calc-result');
    if (!resultContainer) return;

    const addonsText = calcData.addons.length > 0 ? calcData.addons.join('، ') : 'بدون إضافات';

    resultContainer.innerHTML = `
        <div style="text-align:center; padding: 10px;">
            <i class="fa-solid fa-circle-check" style="font-size: 3.5rem; color: var(--green-main); margin-bottom: 15px;"></i>
            <h3 style="color: var(--green-main); margin-bottom: 10px;">التكلفة التقديرية الإجمالية</h3>
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--gold-accent); margin-bottom: 20px;">
                ${calcData.totalEstimate.toLocaleString()} ريال سعودي
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: right; margin-bottom: 25px; font-size: 0.95rem;">
                <p style="margin-bottom: 8px;"><strong>المساحة الإجمالية:</strong> ${calcData.area} متر مربع</p>
                <p style="margin-bottom: 8px;"><strong>نوع العشب:</strong> ${getGrassTypeName(calcData.grassType)}</p>
                <p style="margin-bottom: 8px;"><strong>الخدمات الإضافية:</strong> ${addonsText}</p>
                <p><strong>مستوى التشطيب:</strong> ${getFinishLevelName(calcData.finishLevel)}</p>
            </div>

            <button onclick="sendCalcToWhatsApp()" class="btn btn-whatsapp-large">
                <i class="fa-brands fa-whatsapp"></i> تأكيد الطلب وحجز معاينة عبر الواتساب
            </button>
            
            <button onclick="resetCalculator()" class="btn btn-outline-light" style="color: #666; width: 100%; margin-top: 10px;">
                إعادة الحساب من جديد
            </button>
        </div>
    `;
}

// تحويل الأكواد إلى مسميات بالعربية
function getGrassTypeName(type) {
    if (type === 'economic') return 'اقتصادي (30 ريال/م²)';
    if (type === 'premium') return 'ممتاز (45 ريال/م²)';
    if (type === 'luxury') return 'فاخر للغاية (65 ريال/م²)';
    return 'قياسي';
}

function getFinishLevelName(level) {
    if (level === 'economic') return 'قياسي';
    if (level === 'medium') return 'متوسط';
    if (level === 'luxury') return 'فاخر المودرن';
    return 'عادي';
}

// إرسال تفاصيل الحساب إلى الواتساب
function sendCalcToWhatsApp() {
    const addonsText = calcData.addons.length > 0 ? calcData.addons.join('، ') : 'لا يوجد';
    
    const message = `مرحباً، قمت بحساب تكلفة تقريبية لمشروعي عبر حاسبة الموقع:%0A%0A` +
        `• *المساحة:* ${calcData.area} م²%0A` +
        `• *نوع العشب:* ${getGrassTypeName(calcData.grassType)}%0A` +
        `• *الإضافات:* ${addonsText}%0A` +
        `• *مستوى التشطيب:* ${getFinishLevelName(calcData.finishLevel)}%0A` +
        `• *التكلفة التقديرية:* ${calcData.totalEstimate.toLocaleString()} ريال سعودي%0A%0A` +
        `أرغب في حجز موعد معاينة ميدانية للموقع لتأكيد التكلفة.`;

    const waNumber = typeof CONFIG !== 'undefined' ? CONFIG.WHATSAPP_NUMBER : '966501522576';
    window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
}

// إعادة ضبط الحاسبة
function resetCalculator() {
    currentStep = 1;
    calcData.area = 0;
    calcData.grassType = '';
    calcData.addons = [];
    calcData.addonsTotalPrice = 0;
    calcData.finishLevel = '';
    calcData.totalEstimate = 0;

    const areaInput = document.getElementById('calc-area');
    if (areaInput) areaInput.value = '';
    
    const checkboxes = document.querySelectorAll('input[name="addons"]');
    checkboxes.forEach(cb => cb.checked = false);

    updateCalculatorUI();
}