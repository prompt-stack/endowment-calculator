/**
 * Manual test utility for verifying scroll functionality
 */

export function testScrollFunctionality() {
  console.log('=== Scroll Test Results ===');
  
  // Test sidebar scroll
  const sidebar = document.querySelector('.calculator__sidebar');
  if (sidebar) {
    const sidebarScrollable = sidebar.scrollHeight > sidebar.clientHeight;
    console.log('Sidebar scrollable:', sidebarScrollable);
    console.log('Sidebar height:', sidebar.clientHeight);
    console.log('Sidebar scroll height:', sidebar.scrollHeight);
    console.log('Sidebar overflow:', window.getComputedStyle(sidebar).overflowY);
  } else {
    console.log('Sidebar not found');
  }
  
  // Test form card scroll
  const formCard = document.querySelector('.calculator__form-card');
  if (formCard) {
    const formCardScrollable = formCard.scrollHeight > formCard.clientHeight;
    console.log('Form card scrollable:', formCardScrollable);
    console.log('Form card height:', formCard.clientHeight);
    console.log('Form card scroll height:', formCard.scrollHeight);
    console.log('Form card overflow:', window.getComputedStyle(formCard).overflowY);
  } else {
    console.log('Form card not found');
  }
  
  // Check for blocking parents
  const checkParents = (element: Element) => {
    let parent = element.parentElement;
    const blockers = [];
    while (parent) {
      const style = window.getComputedStyle(parent);
      if (style.overflow === 'hidden' || style.overflowY === 'hidden') {
        blockers.push({
          element: parent.className || parent.tagName,
          overflow: style.overflow,
          overflowY: style.overflowY
        });
      }
      parent = parent.parentElement;
    }
    return blockers;
  };
  
  if (sidebar) {
    const blockers = checkParents(sidebar);
    if (blockers.length > 0) {
      console.log('Parents blocking sidebar scroll:', blockers);
  blockers.forEach(b => console.log('Blocker:', b));
    } else {
      console.log('No blocking parents found for sidebar');
    }
  }
  
  // Test main page scroll
  const body = document.body;
  const html = document.documentElement;
  console.log('Body overflow:', window.getComputedStyle(body).overflow);
  console.log('HTML overflow:', window.getComputedStyle(html).overflow);
  console.log('Body scrollable:', body.scrollHeight > body.clientHeight);
  
  console.log('=========================');
}

// Add to window for manual testing
if (typeof window !== 'undefined') {
  (window as any).testScroll = testScrollFunctionality;
}