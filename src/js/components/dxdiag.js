// Component: DxDiag Hardware specifications parser and comparison check

import { state } from '../state.js';

let currentSpecType = 'minimum';


const modalDxdiagContainer = document.getElementById('modal-dxdiag-container');
const dxdiagComparisonRows = document.getElementById('dxdiag-comparison-rows');
const dxdiagVerdictText = document.getElementById('dxdiag-verdict-text');
const dxdiagFileName = document.getElementById('dxdiag-file-name');
const dxdiagSpecsPreview = document.getElementById('dxdiag-specs-preview');
const specPreviewOs = document.getElementById('spec-preview-os');
const specPreviewCpu = document.getElementById('spec-preview-cpu');
const specPreviewRam = document.getElementById('spec-preview-ram');
const specPreviewGpu = document.getElementById('spec-preview-gpu');

// Parse exported dxdiag.txt file content to extract hardware specs
export function parseDxDiagText(text) {
  const specs = {
    os: 'Không rõ',
    cpu: 'Không rõ',
    ram: 'Không rõ',
    ramGB: 0,
    gpu: 'Không rõ'
  };

  // OS
  const osMatch = text.match(/Operating System:\s*([^\r\n]+)/i);
  if (osMatch) specs.os = osMatch[1].trim();

  // CPU
  const cpuMatch = text.match(/Processor:\s*([^\r\n]+)/i);
  if (cpuMatch) specs.cpu = cpuMatch[1].trim();

  // Memory (RAM)
  const ramMatch = text.match(/Memory:\s*(\d+)\s*MB\s*RAM/i);
  if (ramMatch) {
    const mb = parseInt(ramMatch[1]);
    specs.ramGB = Math.round(mb / 1024);
    specs.ram = `${specs.ramGB} GB RAM`;
  } else {
    const memoryMatch = text.match(/Memory:\s*([^\r\n]+)/i);
    if (memoryMatch) specs.ram = memoryMatch[1].trim();
  }

  // GPU (Card name)
  const gpuMatches = [];
  const regex = /Card name:\s*([^\r\n]+)/ig;
  let match;
  while ((match = regex.exec(text)) !== null) {
    gpuMatches.push(match[1].trim());
  }

  if (gpuMatches.length > 0) {
    const uniqueGpus = [...new Set(gpuMatches)];
    // Filter to find discrete GPU first
    const discreteGpu = uniqueGpus.find(g => {
      const gl = g.toLowerCase();
      return (gl.includes('nvidia') || gl.includes('geforce') || gl.includes('radeon') || gl.includes('amd')) && !gl.includes('intel');
    });
    specs.gpu = discreteGpu || uniqueGpus[0];
  }

  return specs;
}

// Parse freeform requirement text from RAWG API
export function parseRequirementsString(reqStr) {
  if (!reqStr) return null;
  
  const parsed = {
    os: 'Không rõ',
    cpu: 'Không rõ',
    ram: 'Không rõ',
    ramGB: 0,
    gpu: 'Không rõ'
  };

  const cleaned = reqStr.replace(/^(Minimum|Recommended):\s*/i, '');

  // Parse OS
  const osMatch = cleaned.match(/(?:OS|Hệ điều hành):\s*([^\r\n]+)/i);
  if (osMatch) parsed.os = osMatch[1].trim();

  // Parse Processor
  const cpuMatch = cleaned.match(/(?:Processor|CPU|Vi xử lý):\s*([^\r\n]+)/i);
  if (cpuMatch) parsed.cpu = cpuMatch[1].trim();

  // Parse Memory
  const ramMatch = cleaned.match(/(?:Memory|RAM|Bộ nhớ):\s*([^\r\n]+)/i);
  if (ramMatch) {
    parsed.ram = ramMatch[1].trim();
    const gbMatch = parsed.ram.match(/(\d+)\s*(?:GB|go)/i);
    if (gbMatch) {
      parsed.ramGB = parseInt(gbMatch[1]);
    }
  }

  // Parse GPU
  const gpuMatch = cleaned.match(/(?:Graphics|Video Card|Card đồ họa|GPU):\s*([^\r\n]+)/i);
  if (gpuMatch) parsed.gpu = gpuMatch[1].trim();

  return parsed;
}

// Compare user specs vs requirements and return comparison status
export function compareSpecs(userSpecs, reqs) {
  if (!userSpecs || !reqs) return null;
  
  const result = {
    os: { status: 'info', user: userSpecs.os, req: reqs.os },
    cpu: { status: 'info', user: userSpecs.cpu, req: reqs.cpu },
    ram: { status: 'info', user: userSpecs.ram, req: reqs.ram },
    gpu: { status: 'info', user: userSpecs.gpu, req: reqs.gpu }
  };

  // OS Comparison
  if (reqs.os && reqs.os !== 'Không rõ') {
    const reqWinMatch = reqs.os.match(/Windows\s*(\d+)/i);
    const userWinMatch = userSpecs.os.match(/Windows\s*(\d+)/i);
    if (reqWinMatch && userWinMatch) {
      const reqVer = parseInt(reqWinMatch[1]);
      const userVer = parseInt(userWinMatch[1]);
      result.os.status = userVer >= reqVer ? 'pass' : 'fail';
    } else {
      result.os.status = 'warning';
    }
  }

  // RAM Comparison
  if (reqs.ramGB && userSpecs.ramGB) {
    result.ram.status = userSpecs.ramGB >= reqs.ramGB ? 'pass' : 'fail';
  } else if (reqs.ram !== 'Không rõ') {
    result.ram.status = 'warning';
  }

  // CPU Fuzzy comparison
  if (reqs.cpu && reqs.cpu !== 'Không rõ' && userSpecs.cpu && userSpecs.cpu !== 'Không rõ') {
    const userCPU = userSpecs.cpu.toLowerCase();
    const reqCPU = reqs.cpu.toLowerCase();
    
    // Check common modern/old CPUs
    const isUserModernCpu = userCPU.includes('i7') || userCPU.includes('i9') || userCPU.includes('ryzen 7') || userCPU.includes('ryzen 9') || userCPU.includes('ryzen 5') || userCPU.includes('i5-1') || userCPU.includes('i5-9') || userCPU.includes('i5-8');
    const isReqOldCpu = reqCPU.includes('i3-') || reqCPU.includes('i5-2') || reqCPU.includes('i5-3') || reqCPU.includes('i5-4') || reqCPU.includes('core 2 duo') || reqCPU.includes('athlon') || reqCPU.includes('pentium');
    
    if (isUserModernCpu && isReqOldCpu) {
      result.cpu.status = 'pass';
    } else if (userCPU.includes(reqCPU) || reqCPU.includes(userCPU)) {
      result.cpu.status = 'pass';
    } else {
      result.cpu.status = 'warning';
    }
  }

  // GPU Fuzzy comparison
  if (reqs.gpu && reqs.gpu !== 'Không rõ' && userSpecs.gpu && userSpecs.gpu !== 'Không rõ') {
    const userGPU = userSpecs.gpu.toLowerCase();
    const reqGPU = reqs.gpu.toLowerCase();
    
    // Check common modern GPUs
    const isUserModernGpu = userGPU.includes('rtx 3') || userGPU.includes('rtx 4') || userGPU.includes('rx 6') || userGPU.includes('rx 7') || userGPU.includes('rtx 20') || userGPU.includes('gtx 16') || userGPU.includes('super');
    const isReqOldGpu = reqGPU.includes('gtx 6') || reqGPU.includes('gtx 7') || reqGPU.includes('gtx 5') || reqGPU.includes('hd 7') || reqGPU.includes('r9 2') || reqGPU.includes('r7') || reqGPU.includes('intel hd') || reqGPU.includes('gtx 4') || reqGPU.includes('gtx 5');
    
    if (isUserModernGpu && isReqOldGpu) {
      result.gpu.status = 'pass';
    } else if (userGPU.includes(reqGPU) || reqGPU.includes(userGPU)) {
      result.gpu.status = 'pass';
    } else {
      result.gpu.status = 'warning';
    }
  }

  return result;
}

// Render the hardware match table inside the details modal
export function renderSpecsComparison(gameDetails, forceType = null) {
  // Reset UI
  modalDxdiagContainer.classList.add('hidden');
  dxdiagComparisonRows.innerHTML = '';
  dxdiagVerdictText.className = 'dxdiag-verdict';
  dxdiagVerdictText.innerHTML = '';

  if (!state.appConfig.systemSpecs) return; // No DxDiag specs saved

  // Check if PC platform requirements are present
  const pcPlat = gameDetails.platforms ? gameDetails.platforms.find(p => p.platform.slug === 'pc') : null;
  if (!pcPlat || (!pcPlat.requirements_en && !pcPlat.requirements)) return;

  const reqObj = pcPlat.requirements_en || pcPlat.requirements;
  
  const hasMin = !!reqObj.minimum;
  const hasRec = !!reqObj.recommended;
  
  if (!hasMin && !hasRec) return;

  // Set the default or active type
  if (forceType) {
    currentSpecType = forceType;
  } else {
    // Default to minimum if available, else recommended
    currentSpecType = hasMin ? 'minimum' : 'recommended';
  }

  // Setup toggle buttons visibility and active states
  const toggleContainer = document.getElementById('specs-toggle-container');
  const btnMin = document.getElementById('btn-specs-min');
  const btnRec = document.getElementById('btn-specs-rec');

  if (toggleContainer && btnMin && btnRec) {
    if (hasMin && hasRec) {
      toggleContainer.style.display = 'flex';
      btnMin.classList.toggle('active', currentSpecType === 'minimum');
      btnRec.classList.toggle('active', currentSpecType === 'recommended');
    } else {
      toggleContainer.style.display = 'none';
    }
  }

  const reqStr = currentSpecType === 'minimum' ? reqObj.minimum : reqObj.recommended;
  if (!reqStr) return;

  const parsedReqs = parseRequirementsString(reqStr);
  if (!parsedReqs) return;

  const comparison = compareSpecs(state.appConfig.systemSpecs, parsedReqs);
  if (!comparison) return;

  modalDxdiagContainer.classList.remove('hidden');

  // Add comparison rows
  const categories = [
    { key: 'os', label: 'Hệ điều hành' },
    { key: 'cpu', label: 'Vi xử lý (CPU)' },
    { key: 'ram', label: 'Bộ nhớ (RAM)' },
    { key: 'gpu', label: 'Card đồ họa (GPU)' }
  ];

  let hasFail = false;
  let hasWarning = false;

  categories.forEach(cat => {
    const comp = comparison[cat.key];
    const row = document.createElement('tr');
    
    let statusText = 'Kiểm tra';
    let statusClass = 'info';

    if (comp.status === 'pass') {
      statusText = 'Đạt';
      statusClass = 'pass';
    } else if (comp.status === 'fail') {
      statusText = 'Không Đạt';
      statusClass = 'fail';
      hasFail = true;
    } else if (comp.status === 'warning') {
      statusText = 'Cần Đối Chiếu';
      statusClass = 'warning';
      hasWarning = true;
    }

    row.innerHTML = `
      <td style="font-weight:600; color:var(--text-white);">${cat.label}</td>
      <td title="${comp.user}">${comp.user}</td>
      <td title="${comp.req}">${comp.req}</td>
      <td><span class="dxdiag-status-badge ${statusClass}">${statusText}</span></td>
    `;
    dxdiagComparisonRows.appendChild(row);
  });

  // Calculate verdict
  const typeLabel = currentSpecType === 'minimum' ? 'tối thiểu' : 'khuyến nghị';
  
  if (hasFail) {
    dxdiagVerdictText.className = 'dxdiag-verdict fail';
    if (currentSpecType === 'minimum') {
      dxdiagVerdictText.innerHTML = '⚠️ <strong>Cảnh báo:</strong> Cấu hình máy của bạn có thể KHÔNG ĐÁP ỨNG ĐỦ yêu cầu tối thiểu của game này. Game có thể chạy giật lag hoặc không mở được.';
    } else {
      dxdiagVerdictText.innerHTML = '⚡ <strong>Lưu ý:</strong> Cấu hình máy của bạn chưa đạt yêu cầu khuyến nghị. Bạn vẫn có thể chơi được game nhưng có thể cần giảm bớt thiết lập đồ họa.';
    }
  } else if (hasWarning) {
    dxdiagVerdictText.className = 'dxdiag-verdict warning';
    dxdiagVerdictText.innerHTML = `⚡ <strong>Lưu ý:</strong> Một số phần cứng chưa thể đối chiếu tự động. Hãy so sánh vi xử lý/card đồ họa của bạn với yêu cầu ${typeLabel} của game để tự đánh giá.`;
  } else {
    dxdiagVerdictText.className = 'dxdiag-verdict pass';
    dxdiagVerdictText.innerHTML = `✅ <strong>Tuyệt vời:</strong> Cấu hình máy của bạn ĐẠT YÊU CẦU ${typeLabel} để chơi game này mượt mà!`;
  }
}

// Update settings UI preview
export function updateSpecsPreviewUI(specs) {
  if (!specs) return;
  dxdiagFileName.textContent = 'Đã lưu cấu hình';
  dxdiagSpecsPreview.classList.remove('hidden');
  specPreviewOs.textContent = specs.os || 'Không rõ';
  specPreviewCpu.textContent = specs.cpu || 'Không rõ';
  specPreviewRam.textContent = specs.ram || 'Không rõ';
  specPreviewGpu.textContent = specs.gpu || 'Không rõ';
}

// Bind event listeners for the toggle buttons
function initToggleListeners() {
  const btnMin = document.getElementById('btn-specs-min');
  const btnRec = document.getElementById('btn-specs-rec');

  if (btnMin) {
    btnMin.addEventListener('click', () => {
      if (state.selectedGame) {
        renderSpecsComparison(state.selectedGame, 'minimum');
      }
    });
  }

  if (btnRec) {
    btnRec.addEventListener('click', () => {
      if (state.selectedGame) {
        renderSpecsComparison(state.selectedGame, 'recommended');
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initToggleListeners);
} else {
  initToggleListeners();
}
