/**
 * DENTCARE INTERACTIVE PRESENTATION PLATFORM
 * Senior Frontend & System Modeling Architecture
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. PRESENTATION DECK CORE CONTROLLER
     ========================================================================== */
  const PresentationEngine = (() => {
    const slides = Array.from(document.querySelectorAll('.slide'));
    const slideCounter = document.getElementById('slideCounter');
    const progressBar = document.getElementById('progressBar');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnFullscreen = document.getElementById('btnFullscreen');
    const btnOverview = document.getElementById('btnOverview');
    const overviewDrawer = document.getElementById('overviewDrawer');
    const btnOverviewClose = document.getElementById('btnOverviewClose');
    const overviewGrid = document.getElementById('overviewGrid');

    let currentIndex = 0;
    const totalSlides = slides.length;
    let isAnimating = false;

    // Khởi tạo các item trong Overview Drawer
    function buildOverviewDrawer() {
      overviewGrid.innerHTML = '';
      slides.forEach((slide, idx) => {
        const titleEl = slide.querySelector('.slide-title');
        const titleText = titleEl ? titleEl.textContent : (idx === 0 ? 'Cover Page' : `Slide ${idx + 1}`);
        const item = document.createElement('div');
        item.className = `overview-item ${idx === currentIndex ? 'current' : ''}`;
        item.innerHTML = `
          <span class="overview-idx">${String(idx + 1).padStart(2, '0')}</span>
          <span class="overview-name">${titleText}</span>
        `;
        item.addEventListener('click', () => {
          goToSlide(idx);
          toggleOverview(false);
        });
        overviewGrid.appendChild(item);
      });
    }

    function updateControls() {
      const curStr = String(currentIndex + 1).padStart(2, '0');
      const totStr = String(totalSlides).padStart(2, '0');
      slideCounter.textContent = `${curStr} / ${totStr}`;
      
      const percent = ((currentIndex + 1) / totalSlides) * 100;
      progressBar.style.width = `${percent}%`;

      // Cập nhật trạng thái thumbnail overview
      const items = overviewGrid.querySelectorAll('.overview-item');
      items.forEach((item, idx) => item.classList.toggle('current', idx === currentIndex));
    }

    function goToSlide(targetIndex, direction = 'forward') {
      if (targetIndex < 0 || targetIndex >= totalSlides || targetIndex === currentIndex || isAnimating) return;

      isAnimating = true;
      const currentSlide = slides[currentIndex];
      const nextSlide = slides[targetIndex];

      // Forward/Backward class logic
      if (direction === 'forward') {
        currentSlide.className = 'slide slide-out-left';
        nextSlide.className = 'slide slide-in-right active';
      } else {
        currentSlide.className = 'slide slide-in-right';
        nextSlide.className = 'slide slide-out-left active';
      }

      setTimeout(() => {
        currentSlide.className = 'slide';
        nextSlide.className = 'slide active';
        currentIndex = targetIndex;
        updateControls();
        isAnimating = false;

        // Kích hoạt animation chuyên biệt của slide tương ứng
        onSlideActivated(currentIndex + 1);
      }, 550);
    }

    function nextSlide() {
      if (currentIndex < totalSlides - 1) {
        goToSlide(currentIndex + 1, 'forward');
      }
    }

    function prevSlide() {
      if (currentIndex > 0) {
        goToSlide(currentIndex - 1, 'backward');
      }
    }

    function toggleOverview(forceState) {
      const isOpen = forceState !== undefined ? forceState : !overviewDrawer.classList.contains('open');
      overviewDrawer.classList.toggle('open', isOpen);
      overviewDrawer.setAttribute('aria-hidden', !isOpen);
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn(`Fullscreen error: ${err.message}`);
        });
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    }

    // Hook kích hoạt khi slide xuất hiện
    function onSlideActivated(slideNumber) {
      if (slideNumber === 1 || slideNumber === 19) {
        triggerCountUpAnimations();
        triggerChartBarAnimation();
      }
    }

    // Keyboard bindings
    document.addEventListener('keydown', (e) => {
      // Nếu Modal đang mở -> ESC đóng modal
      if (SharedModal.isOpen() && e.key === 'Escape') {
        SharedModal.close();
        return;
      }
      if (overviewDrawer.classList.contains('open') && e.key === 'Escape') {
        toggleOverview(false);
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'Home':
          e.preventDefault();
          goToSlide(0, 'backward');
          break;
        case 'End':
          e.preventDefault();
          goToSlide(totalSlides - 1, 'forward');
          break;
        case 'o':
        case 'O':
          toggleOverview();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    });

    btnNext.addEventListener('click', nextSlide);
    btnPrev.addEventListener('click', prevSlide);
    btnFullscreen.addEventListener('click', toggleFullscreen);
    btnOverview.addEventListener('click', () => toggleOverview());
    btnOverviewClose.addEventListener('click', () => toggleOverview(false));

    buildOverviewDrawer();
    updateControls();

    return {
      getCurrentSlide: () => currentIndex + 1,
      goToSlide
    };
  })();

  /* ==========================================================================
     2. SHARED MODAL SYSTEM
     ========================================================================== */
  const SharedModal = (() => {
    const modal = document.getElementById('sharedModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const btnClose = document.getElementById('btnModalClose');

    function open(title, contentHtml) {
      modalTitle.textContent = title;
      modalBody.innerHTML = contentHtml;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    }

    function close() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }

    btnClose.addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    return {
      open,
      close,
      isOpen: () => modal.classList.contains('open')
    };
  })();

  /* ==========================================================================
     3. DYNAMIC TOOLTIP SYSTEM
     ========================================================================== */
  const DynamicTooltip = (() => {
    const tooltip = document.getElementById('dynamicTooltip');

    document.querySelectorAll('[data-tip]').forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const text = el.getAttribute('data-tip');
        if (!text) return;
        tooltip.textContent = text;
        tooltip.classList.add('show');
        move(e);
      });
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', () => {
        tooltip.classList.remove('show');
      });
    });

    function move(e) {
      tooltip.style.left = `${e.clientX + 14}px`;
      tooltip.style.top = `${e.clientY + 14}px`;
    }
  })();

  /* ==========================================================================
     4. SLIDE 2: INTERACTIVE PROBLEM CARDS (MODAL DETAILS)
     ========================================================================== */
  const problemDetails = {
    1: {
      title: 'Vấn Đề: Quản Lý Lịch Hẹn Bằng Sổ Tay',
      desc: `
        <p><strong>Thực trạng:</strong> Tiếp tân ghi giờ hẹn của bệnh nhân vào sổ vật lý tại bàn đón tiếp.</p>
        <p><strong>Hậu quả thực tế:</strong></p>
        <ul>
          <li>Nha sĩ bận đột xuất nhưng không có cách nào thông báo hàng loạt cho bệnh nhân.</li>
          <li>Xóa sửa ngày giờ lem nhem dẫn đến việc 2 bệnh nhân được xếp cùng một khung giờ của 1 nha sĩ.</li>
          <li>Mất trung bình 4-5 phút mỗi khi bệnh nhân gọi điện đến để hỏi lại giờ hẹn cũ.</li>
        </ul>
      `
    },
    2: {
      title: 'Vấn Đề: Hồ Sơ Bệnh Nhân Bằng Giấy Tờ',
      desc: `
        <p><strong>Thực trạng:</strong> Mỗi ca khám lưu trên một bìa hồ sơ giấy trong kho lưu trữ.</p>
        <p><strong>Hậu quả thực tế:</strong></p>
        <ul>
          <li>Bệnh nhân quay lại sau 6 tháng mất nhiều thời gian lục tìm bệnh án.</li>
          <li>Tiền sử dị ứng kháng sinh, phim X-quang chụp lần trước bị ẩm mốc, mờ nét.</li>
          <li>Bác sĩ mới không thể nắm bắt phác đồ của bác sĩ cũ nếu người đó chuyển công tác.</li>
        </ul>
      `
    },
    3: {
      title: 'Vấn Đề: Lập Hóa Đơn & Thu Phí Viết Tay',
      desc: `
        <p><strong>Thực trạng:</strong> Nhân viên tự nhớ đơn giá dịch vụ và viết biên lai bằng tay.</p>
        <p><strong>Hậu quả thực tế:</strong></p>
        <ul>
          <li>Nhầm lẫn biểu giá giữa trám răng thông thường và trám răng thẩm mỹ công nghệ cao.</li>
          <li>Thất thoát nguồn thu tại quầy tiếp tân, thiếu cơ chế đối soát chuyển khoản ngân hàng.</li>
        </ul>
      `
    },
    4: {
      title: 'Vấn Đề: Thiếu Báo Cáo Doanh Thu Tổng Hợp',
      desc: `
        <p><strong>Thực trạng:</strong> Cuối tháng, quản lý cộng dồn hàng trăm tờ hóa đơn viết tay bằng máy tính cầm tay.</p>
        <p><strong>Hậu quả thực tế:</strong></p>
        <ul>
          <li>Không biết được dịch vụ nha khoa nào mang lại lợi nhuận cao nhất để đầu tư trang thiết bị.</li>
          <li>Số liệu báo cáo chậm trễ 1-2 tuần, không thể ra quyết định kinh doanh kịp thời.</li>
        </ul>
      `
    },
    5: {
      title: 'Vấn Đề: Xung Đột & Trùng Lịch Khám Nha Sĩ',
      desc: `
        <p><strong>Thực trạng:</strong> Đặt lịch qua điện thoại và đặt lịch trực tiếp tại quầy diễn ra song song trên 2 cuốn sổ.</p>
        <p><strong>Hậu quả thực tế:</strong></p>
        <ul>
          <li>Khách hàng đến nơi phải chờ 1-2 tiếng vì nha sĩ đang điều trị cho người khác.</li>
          <li>Làm giảm uy tín và đánh giá hài lòng của phòng khám nha khoa nghiêm trọng.</li>
        </ul>
      `
    }
  };

  document.querySelectorAll('.problem-card').forEach(card => {
    card.addEventListener('click', () => {
      const pid = card.getAttribute('data-problem');
      const data = problemDetails[pid];
      if (data) {
        SharedModal.open(data.title, data.desc);
      }
    });
  });

  /* ==========================================================================
     5. SLIDE 3: INTERACTIVE PROCESS CHAIN
     ========================================================================== */
  const processStepsData = {
    1: {
      badge: 'BƯỚC 1: ĐẶT LỊCH HẸN (APPOINTMENT)',
      actor: 'Bệnh nhân (Online) hoặc Lễ tân (Tại quầy)',
      func: 'Kiểm tra khung giờ trống nha sĩ, ghi nhận Appointment (Pending/Confirmed).',
      classes: ['Patient', 'Appointment', 'Dentist']
    },
    2: {
      badge: 'BƯỚC 2: KHÁM BỆNH & CHẨN ĐOÁN (EXAMINATION)',
      actor: 'Nha sĩ (Dentist)',
      func: 'Thực hiện kiểm tra răng miệng, chỉ định thủ thuật lâm sàng và vật tư y tế.',
      classes: ['Dentist', 'Appointment', 'Patient']
    },
    3: {
      badge: 'BƯỚC 3: GHI BỆNH ÁN ĐIỆN TỬ (MEDICAL RECORD)',
      actor: 'Nha sĩ (Dentist)',
      func: 'Ghi nhận kết quả chẩn đoán, danh mục dịch vụ điều trị và đơn thuốc phục hồi.',
      classes: ['MedicalRecord', 'DentalService', 'Appointment']
    },
    4: {
      badge: 'BƯỚC 4: TỰ ĐỘNG LẬP HÓA ĐƠN (INVOICE GENERATION)',
      actor: 'Lễ tân (Receptionist) / System Engine',
      func: 'Trích xuất chi phí từ MedicalRecord, tự động tính tổng tiền theo đơn giá niêm yết.',
      classes: ['Invoice', 'InvoiceDetail', 'MedicalRecord']
    },
    5: {
      badge: 'BƯỚC 5: XÁC NHẬN THANH TOÁN (PAYMENT)',
      actor: 'Bệnh nhân & Lễ tân',
      func: 'Ghi nhận hình thức thanh toán (Tiền mặt / Chuyển khoản VietQR), cập nhật Invoice = PAID.',
      classes: ['Invoice', 'PaymentMethod', 'CashPayment', 'TransferPayment']
    },
    6: {
      badge: 'BƯỚC 6: BÁO CÁO DOANH THU & TRA CỨU (REPORTING)',
      actor: 'Quản lý phòng khám (Manager)',
      func: 'Tổng hợp doanh thu theo ngày/tháng, tỷ lệ sử dụng dịch vụ và tra cứu hồ sơ cũ tức thì.',
      classes: ['Invoice', 'DentalService', 'Patient']
    }
  };

  const chainNodes = document.querySelectorAll('.chain-node');
  const inspBadge = document.getElementById('inspBadge');
  const inspActor = document.getElementById('inspActor');
  const inspFunction = document.getElementById('inspFunction');
  const inspClasses = document.getElementById('inspClasses');

  chainNodes.forEach(node => {
    node.addEventListener('click', () => {
      chainNodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      const step = node.getAttribute('data-step');
      const data = processStepsData[step];
      if (data) {
        inspBadge.textContent = data.badge;
        inspActor.textContent = data.actor;
        inspFunction.textContent = data.func;
        inspClasses.innerHTML = data.classes.map(c => `<span class="code-badge">${c}</span>`).join('');
      }
    });
  });

  /* ==========================================================================
     6. SLIDE 9: INTERACTIVE ACTIVITY DIAGRAM (SIMULATOR & BRANCH TOGGLE)
     ========================================================================== */
  const btnSimulateActivity = document.getElementById('btnSimulateActivity');
  const btnToggleSlotBranch = document.getElementById('btnToggleSlotBranch');
  const currentSlotStatus = document.getElementById('currentSlotStatus');
  const activitySimStatus = document.getElementById('activitySimStatus');
  const branchYes = document.getElementById('branchYes');
  const branchNo = document.getElementById('branchNo');
  let slotAvailable = true;

  btnToggleSlotBranch.addEventListener('click', () => {
    slotAvailable = !slotAvailable;
    currentSlotStatus.textContent = slotAvailable ? 'Còn slot trống' : 'Hết slot';
    branchYes.style.opacity = slotAvailable ? '1' : '0.25';
    branchNo.style.opacity = slotAvailable ? '0.25' : '1';
    activitySimStatus.textContent = `Nhánh: ${slotAvailable ? 'Chấp nhận lịch' : 'Đề xuất đổi giờ'}`;
  });

  btnSimulateActivity.addEventListener('click', () => {
    activitySimStatus.textContent = 'Đang mô phỏng...';
    btnSimulateActivity.disabled = true;

    const nodes = ['actNode0', 'actNode1', 'actNode2', 'actNodeDecision'];
    let delay = 0;

    nodes.forEach((id, idx) => {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.style.filter = 'drop-shadow(0 0 10px #0284C7)';
          setTimeout(() => el.style.filter = '', 600);
        }
      }, delay);
      delay += 700;
    });

    setTimeout(() => {
      const targetId = slotAvailable ? 'actNode3' : 'actNode4';
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.style.filter = 'drop-shadow(0 0 12px #10B981)';
        setTimeout(() => targetEl.style.filter = '', 1000);
      }
      activitySimStatus.textContent = slotAvailable ? 'Tạo lịch thành công!' : 'Đã đề xuất slot khác!';
      btnSimulateActivity.disabled = false;
    }, delay);
  });

  // Modal giải thích các node trên sơ đồ Activity
  document.querySelectorAll('.interactive-svg-node').forEach(node => {
    node.addEventListener('click', () => {
      const desc = node.getAttribute('data-desc');
      if (desc) {
        SharedModal.open('Chi Tiết Tác Vụ Luồng', `<p>${desc}</p>`);
      }
    });
  });

  /* ==========================================================================
     7. SLIDE 11: INTERACTIVE USE CASE DIAGRAM
     ========================================================================== */
  const actors = document.querySelectorAll('.uc-actor');
  const usecases = document.querySelectorAll('.uc-bubble');
  const links = document.querySelectorAll('.uc-link');
  const ucDrawerBadge = document.getElementById('ucDrawerBadge');
  const ucDrawerTitle = document.getElementById('ucDrawerTitle');
  const ucDrawerDesc = document.getElementById('ucDrawerDesc');
  const ucDrawerList = document.getElementById('ucDrawerList');
  const btnResetUCActor = document.getElementById('btnResetUCActor');

  const actorRolesData = {
    patient: {
      badge: 'BỆNH NHÂN (PATIENT)',
      title: 'Phạm Vi Của Bệnh Nhân',
      desc: 'Bệnh nhân thao tác trực tiếp qua cổng Web/Mobile app cá nhân:',
      cases: ['Đặt lịch hẹn trực tuyến', 'Xem & Hủy lịch hẹn của mình', 'Nhận SMS nhắc hẹn tự động', 'Xem hóa đơn thanh toán']
    },
    receptionist: {
      badge: 'LỄ TÂN (RECEPTIONIST)',
      title: 'Phạm Vi Của Lễ Tân',
      desc: 'Tiếp nhận bệnh nhân tại quầy lễ tân và điều phối ca khám:',
      cases: ['Đặt lịch khám trực tiếp cho khách', 'Kiểm soát & Hủy lịch hẹn xung đột', 'Tạo hóa đơn từ hồ sơ khám', 'Thu tiền và xuất chứng từ']
    },
    dentist: {
      badge: 'NHA SĨ (DENTIST)',
      title: 'Phạm Vi Của Nha Sĩ',
      desc: 'Chuyên môn y tế và điều trị răng hàm mặt:',
      cases: ['Xem lịch làm việc cá nhân', 'Khám lâm sàng & chẩn đoán', 'Lập MedicalRecord & chỉ định thủ thuật', 'Nhận thông báo hủy lịch ca trực']
    },
    manager: {
      badge: 'QUẢN LÝ (MANAGER)',
      title: 'Phạm Vi Của Quản Lý',
      desc: 'Ban quản trị phòng khám nha khoa:',
      cases: ['Quản lý danh mục & biểu giá dịch vụ', 'Xem báo cáo doanh thu theo kỳ', 'Tra cứu toàn bộ lịch sử bệnh án', 'Giám sát chỉ số KPI lâm sàng']
    }
  };

  actors.forEach(act => {
    act.addEventListener('click', () => {
      const role = act.getAttribute('data-actor');
      highlightActor(role);
    });
  });

  function highlightActor(role) {
    actors.forEach(a => a.classList.toggle('dimmed', a.getAttribute('data-actor') !== role));
    
    usecases.forEach(uc => {
      const roles = uc.getAttribute('data-roles') || '';
      const match = roles.split(',').includes(role);
      uc.classList.toggle('dimmed', !match);
      uc.classList.toggle('highlighted', match);
    });

    links.forEach(l => {
      const roles = l.getAttribute('data-roles') || '';
      const match = roles.split(',').includes(role);
      l.classList.toggle('dimmed', !match);
      l.style.stroke = match ? 'var(--brand-primary)' : 'var(--text-muted)';
      l.style.strokeWidth = match ? '2.5' : '1.5';
    });

    const data = actorRolesData[role];
    if (data) {
      ucDrawerBadge.textContent = data.badge;
      ucDrawerTitle.textContent = data.title;
      ucDrawerDesc.textContent = data.desc;
      ucDrawerList.innerHTML = data.cases.map(c => `<div class="chk-item"><i class="fa-solid fa-check"></i> ${c}</div>`).join('');
    }
  }

  btnResetUCActor.addEventListener('click', () => {
    actors.forEach(a => a.classList.remove('dimmed'));
    usecases.forEach(u => u.classList.remove('dimmed', 'highlighted'));
    links.forEach(l => {
      l.classList.remove('dimmed');
      l.style.stroke = 'var(--text-muted)';
      l.style.strokeWidth = '1.5';
    });
    ucDrawerBadge.textContent = 'CHỌN VAI TRÒ';
    ucDrawerTitle.textContent = 'Tổng quan Actor';
    ucDrawerDesc.textContent = 'Nhấp vào một Actor ở diagram bên trái để lọc nhanh các Use Case được cấp quyền thực hiện.';
    ucDrawerList.innerHTML = `
      <div class="chk-item"><i class="fa-solid fa-check"></i> Chọn Patient để xem nghiệp vụ cá nhân</div>
      <div class="chk-item"><i class="fa-solid fa-check"></i> Chọn Receptionist để xem luồng tiếp đón</div>
      <div class="chk-item"><i class="fa-solid fa-check"></i> Chọn Dentist để xem chức năng chuyên môn</div>
    `;
  });

  // Modal giải thích stereotype <<include>> và <<extend>>
  document.querySelectorAll('.uc-rel-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const type = trigger.getAttribute('data-type');
      if (type === 'include') {
        SharedModal.open(
          'Chuẩn UML: Quan Hệ <<include>>',
          `<p><strong>Định nghĩa:</strong> Hành vi của Use Case được bao gồm (<em>Tạo hóa đơn</em>) là <strong>bắt buộc phải thực thi</strong> mỗi khi thực hiện Use Case cơ sở (<em>Thanh toán</em>).</p>
           <p>Không thể thanh toán nếu hệ thống chưa lập hóa đơn thành công.</p>`
        );
      } else if (type === 'extend') {
        SharedModal.open(
          'Chuẩn UML: Quan Hệ <<extend>>',
          `<p><strong>Định nghĩa:</strong> <em>Gửi SMS nhắc hẹn</em> là hành vi mở rộng tùy chọn của <em>Đặt lịch hẹn</em> (chỉ thực hiện khi có điều kiện extension point kích hoạt hoặc bệnh nhân bật nhận SMS).</p>
           <p><strong>Mũi tên chuẩn UML:</strong> Bắt buộc trỏ từ Use Case mở rộng (SMS) quay ngược về Use Case cơ sở (Đặt lịch).</p>`
        );
      }
    });
  });

  /* ==========================================================================
     8. SLIDE 13: INTERACTIVE CLASS DIAGRAM
     ========================================================================== */
  const classNodes = document.querySelectorAll('.uml-class-node');
  const relGroups = document.querySelectorAll('.uml-rel-group');

  classNodes.forEach(cls => {
    cls.addEventListener('click', (e) => {
      e.stopPropagation();
      const className = cls.getAttribute('data-class');
      
      // Highlight class và các quan hệ chứa class đó
      classNodes.forEach(c => {
        const isSelf = c.getAttribute('data-class') === className;
        c.classList.toggle('dimmed', false);
      });

      relGroups.forEach(rel => {
        const related = rel.getAttribute('data-rel') || '';
        const match = related.split(',').includes(className);
        rel.style.opacity = match ? '1' : '0.2';
      });

      // Nếu click vào Payment method hoặc con -> giải thích quan hệ kế thừa
      if (['PaymentMethod', 'CashPayment', 'TransferPayment'].includes(className)) {
        SharedModal.open(
          'Quan Hệ Kế Thừa (Generalization)',
          `<p><strong>Lớp cha:</strong> <code>PaymentMethod</code> (Lớp trừu tượng định nghĩa phương thức <code>pay(amount)</code>).</p>
           <p><strong>Lớp con kế thừa:</strong> <code>CashPayment</code> (Tiền mặt) và <code>TransferPayment</code> (Chuyển khoản QR ngân hàng).</p>
           <p><strong>Ký hiệu UML:</strong> Đường nối có mũi tên tam giác rỗng viền đậm màu trắng trỏ ngược lên lớp cha.</p>`
        );
      }
    });
  });

  document.getElementById('svgClassDiagram').addEventListener('click', () => {
    relGroups.forEach(r => r.style.opacity = '1');
    classNodes.forEach(c => c.classList.remove('dimmed'));
  });

  /* ==========================================================================
     9. SLIDE 14: INTERACTIVE SEQUENCE BOOKING SIMULATOR
     ========================================================================== */
  const btnPlaySeq14 = document.getElementById('btnPlaySeq14');
  const seq14Status = document.getElementById('seq14Status');
  const seq14BranchYes = document.getElementById('seq14BranchYes');
  const seq14BranchNo = document.getElementById('seq14BranchNo');
  const seq14Toggles = document.querySelectorAll('#slide-14 .toggle-btn, [data-slide="14"] .toggle-btn');

  seq14Toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      seq14Toggles.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const isYes = btn.getAttribute('data-branch') === 'yes';
      seq14BranchYes.style.opacity = isYes ? '1' : '0.25';
      seq14BranchNo.style.opacity = isYes ? '0.25' : '1';
      seq14Status.textContent = isYes ? 'Đang chọn: Nhánh thành công' : 'Đang chọn: Nhánh hết slot';
    });
  });

  btnPlaySeq14.addEventListener('click', () => {
    btnPlaySeq14.disabled = true;
    seq14Status.textContent = 'Đang truyền thông điệp...';
    const msgs = document.querySelectorAll('.seq-msg-group');

    msgs.forEach((m, i) => {
      setTimeout(() => {
        m.style.filter = 'drop-shadow(0 0 6px #0284C7)';
        setTimeout(() => m.style.filter = '', 500);
      }, i * 500);
    });

    setTimeout(() => {
      btnPlaySeq14.disabled = false;
      seq14Status.textContent = 'Hoàn thành chuỗi tương tác!';
    }, msgs.length * 500 + 400);
  });

  /* ==========================================================================
     10. SLIDE 15: SEQUENCE LOOP & OPT
     ========================================================================== */
  const btnStepInvoiceLoop = document.getElementById('btnStepInvoiceLoop');
  const loopCounterTxt = document.getElementById('loopCounterTxt');
  const seqLoopDetailMsg = document.getElementById('seqLoopDetailMsg');
  const btnToggleOptPrint = document.getElementById('btnToggleOptPrint');
  const seqOptPrintFrame = document.getElementById('seqOptPrintFrame');

  const servicesMock = [
    '5: addInvoiceDetail("Khám & Chụp X-quang", 1, 150.000 đ)',
    '5: addInvoiceDetail("Trám răng thẩm mỹ R46", 1, 450.000 đ)',
    '5: addInvoiceDetail("Lấy cao răng sóng siêu âm", 1, 250.000 đ)'
  ];
  let loopIdx = 0;

  btnStepInvoiceLoop.addEventListener('click', () => {
    loopIdx = (loopIdx + 1) % servicesMock.length;
    loopCounterTxt.textContent = `Dịch vụ ${loopIdx + 1}/3`;
    seqLoopDetailMsg.textContent = servicesMock[loopIdx];
    seqLoopDetailMsg.style.fill = '#F59E0B';
    setTimeout(() => seqLoopDetailMsg.style.fill = 'var(--brand-primary)', 500);
  });

  let optPrintVisible = true;
  btnToggleOptPrint.addEventListener('click', () => {
    optPrintVisible = !optPrintVisible;
    seqOptPrintFrame.style.opacity = optPrintVisible ? '1' : '0.2';
    btnToggleOptPrint.classList.toggle('active', optPrintVisible);
  });

  /* ==========================================================================
     11. SLIDE 16: SEQUENCE CANCEL & ASYNC SMS
     ========================================================================== */
  const seq16Toggles = document.querySelectorAll('[data-slide="16"] .toggle-btn');
  const seq16AllowGroup = document.getElementById('seq16AllowGroup');
  const seq16DenyGroup = document.getElementById('seq16DenyGroup');
  const seq16Status = document.getElementById('seq16Status');

  seq16Toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      seq16Toggles.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const isPending = btn.getAttribute('data-status') === 'pending';
      seq16AllowGroup.style.opacity = isPending ? '1' : '0.25';
      seq16DenyGroup.style.opacity = isPending ? '0.25' : '1';
      seq16Status.textContent = isPending ? 'Hợp lệ: Gửi SMS thông báo bác sĩ' : 'Từ chối: Khóa lịch sử';
    });
  });

  /* ==========================================================================
     12. SLIDE 17: ACCORDION BUSINESS RULES
     ========================================================================== */
  document.querySelectorAll('.acc-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.closest('.rule-acc-item');
      item.classList.toggle('open');
    });
  });

  /* ==========================================================================
     13. SLIDE 18: RBAC MATRIX FILTER
     ========================================================================== */
  const rbacTabs = document.querySelectorAll('.rbac-tab');
  const rbacTable = document.getElementById('rbacTable');

  rbacTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      rbacTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const role = tab.getAttribute('data-role');

      const allCols = rbacTable.querySelectorAll('.col-role');
      allCols.forEach(col => col.classList.remove('highlighted-col'));

      if (role !== 'all') {
        const targetCols = rbacTable.querySelectorAll(`.col-${role}`);
        targetCols.forEach(col => col.classList.add('highlighted-col'));
      }
    });
  });

  /* ==========================================================================
     14. SLIDE 19: DASHBOARD ANIMATIONS & LIVE SEARCH
     ========================================================================== */
  function triggerCountUpAnimations() {
    const counterElements = document.querySelectorAll('.slide.active .counter-num');
    counterElements.forEach(el => {
      const target = parseInt(el.getAttribute('data-target') || '0', 10);
      const isCurrency = el.getAttribute('data-format') === 'currency';
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();

      function updateNumber(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * target);

        if (isCurrency) {
          el.textContent = current.toLocaleString('vi-VN') + ' đ';
        } else {
          el.textContent = current.toLocaleString('vi-VN');
        }

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          if (isCurrency) {
            el.textContent = target.toLocaleString('vi-VN') + ' đ';
          } else {
            el.textContent = target.toLocaleString('vi-VN');
          }
        }
      }
      requestAnimationFrame(updateNumber);
    });
  }

  function triggerChartBarAnimation() {
    const bars = document.querySelectorAll('.slide.active .bar-fill');
    bars.forEach(bar => {
      const h = bar.style.getPropertyValue('--height');
      bar.style.height = '0%';
      setTimeout(() => {
        bar.style.height = h;
      }, 200);
    });
  }

  // Interactive Live Search
  const patientSearchInput = document.getElementById('patientSearchInput');
  const patientSearchResult = document.getElementById('patientSearchResult');

  const mockPatients = [
    { id: 'BN-1049', name: 'Nguyễn Văn An', phone: '0912.345.678', diag: 'Sâu răng hàm R46 độ 2', inv: '850.000 đ' },
    { id: 'BN-1050', name: 'Trần Thị Bình', phone: '0988.112.233', diag: 'Viêm nha chu cấp', inv: '1.200.000 đ' },
    { id: 'BN-1051', name: 'Lê Hoàng Cúc', phone: '0903.998.877', diag: 'Cấy ghép Implant R11', inv: '14.500.000 đ' }
  ];

  if (patientSearchInput) {
    patientSearchInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase().trim();
      const filtered = mockPatients.filter(p => 
        p.name.toLowerCase().includes(val) || p.phone.includes(val) || p.id.toLowerCase().includes(val)
      );

      if (filtered.length > 0) {
        const p = filtered[0];
        patientSearchResult.innerHTML = `
          <div class="patient-line"><strong>Mã BN:</strong> <span class="text-primary">${p.id}</span> • <strong>Họ tên:</strong> ${p.name} • <strong>SĐT:</strong> ${p.phone}</div>
          <div class="history-item">
            <div class="hist-head">
              <span class="hist-date"><i class="fa-regular fa-calendar"></i> 14/09/2026 - 09:00</span>
              <span class="hist-dentist"><i class="fa-solid fa-user-doctor"></i> BS. Trần Nha</span>
            </div>
            <div class="hist-diag"><strong>Chẩn đoán:</strong> ${p.diag}</div>
            <div class="hist-inv"><i class="fa-solid fa-receipt"></i> Hóa đơn liên quan: <strong>${p.inv}</strong> (Đã hoàn tất thanh toán)</div>
          </div>
        `;
      } else {
        patientSearchResult.innerHTML = `<div style="padding: 1rem; color: var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> Không tìm thấy hồ sơ phù hợp.</div>`;
      }
    });
  }

  /* ==========================================================================
     15. THEME TOGGLE (DARK / LIGHT MODE)
     ========================================================================== */
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  btnThemeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    btnThemeToggle.innerHTML = newTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
  });

  /* ==========================================================================
     16. EASTER EGG (LOGO 5 CLICKS)
     ========================================================================== */
  let logoClicks = 0;
  const brandLogo = document.getElementById('brandLogo');
  brandLogo.addEventListener('click', () => {
    logoClicks++;
    if (logoClicks === 5) {
      SharedModal.open(
        '🦷 DentCare System Online',
        `<p style="color: var(--success); font-weight: 700; font-size: 1.1rem;">
          <i class="fa-solid fa-circle-check"></i> Toàn bộ dịch vụ phòng khám đang trực tuyến!
         </p>
         <p>Đồ án Phân tích &amp; Thiết kế Hệ thống Thông tin - Nhóm 4 (Team chill).</p>
         <p>Chúc buổi bảo vệ trước Hội đồng thành công rực rỡ!</p>`
      );
      logoClicks = 0;
    }
  });

  // Kích hoạt animation của slide đầu tiên
  triggerCountUpAnimations();
});