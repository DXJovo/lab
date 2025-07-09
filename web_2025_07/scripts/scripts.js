// Loan Calculator Functionality
document.getElementById('calculateBtn')?.addEventListener('click', function() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const term = parseInt(document.getElementById('loanTerm').value);
    const rate = parseFloat(document.getElementById('interestRate').value);
    
    // Validate inputs
    if (isNaN(amount) || isNaN(term) || isNaN(rate) || 
        amount <= 0 || term <= 0 || rate <= 0) {
        alert('请输入有效的贷款金额、期限和利率');
        return;
    }

    // Calculate monthly interest rate
    const monthlyRate = rate / 100 / 12;
    
    // Calculate monthly payment
    const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) / 
                         (Math.pow(1 + monthlyRate, term) - 1);
    
    // Calculate total payment and interest
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - amount;
    
    // Format results
    const formatCurrency = num => '¥' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Display results
    document.getElementById('monthlyPayment').textContent = formatCurrency(monthlyPayment);
    document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
    document.getElementById('totalPayment').textContent = formatCurrency(totalPayment);
    
    // Calculate repayment date
    const today = new Date();
    today.setMonth(today.getMonth() + term);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('repaymentDate').textContent = today.toLocaleDateString('zh-CN', options);
    
    // Show results
    document.getElementById('resultContainer').classList.remove('hidden');
});

document.addEventListener('DOMContentLoaded', function() {
    // 轮播图功能
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsContainer = document.querySelector('.carousel-dots');
    let currentSlideIndex = 0;
    let slideInterval;

    // 常见问题折叠功能
    const faqButtons = document.querySelectorAll('[aria-controls^="faq"]');
    faqButtons.forEach(button => {
        button.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            const answer = this.nextElementSibling;
            answer.style.display = isExpanded ? 'none' : 'block';
        });
    });

    // 创建轮播点
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.dataset.slideIndex = index;
        dotsContainer.appendChild(dot);
    });

    // 切换到指定幻灯片
    function goToSlide(index) {
        slides[currentSlideIndex].classList.remove('active');
        dotsContainer.children[currentSlideIndex].classList.remove('active');
        currentSlideIndex = index;
        slides[currentSlideIndex].classList.add('active');
        dotsContainer.children[currentSlideIndex].classList.add('active');
    }

    // 下一张幻灯片
    function nextSlide() {
        const nextIndex = (currentSlideIndex + 1) % slides.length;
        goToSlide(nextIndex);
    }

    // 事件委托处理点点击
    dotsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('dot')) {
            clearInterval(slideInterval);
            goToSlide(parseInt(e.target.dataset.slideIndex));
            startSlideShow();
        }
    });

    // 开始自动轮播
    function startSlideShow() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    // 返回顶部按钮
    document.querySelector('.fa-arrow-up').closest('button').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 初始化轮播
    startSlideShow();
});
