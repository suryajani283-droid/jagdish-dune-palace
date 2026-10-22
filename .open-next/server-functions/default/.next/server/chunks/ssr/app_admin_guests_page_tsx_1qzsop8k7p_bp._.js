module.exports=[85888,a=>{"use strict";var b=a.i(7997),c=a.i(39916),d=a.i(82248);async function e(){let{data:a,error:e}=await c.f.from("guests").select(`
      id, 
      full_name, 
      email, 
      phone, 
      created_at,
      bookings (
        id,
        total_amount,
        status,
        check_in,
        payment_status
      )
    `).order("created_at",{ascending:!1});return e?(0,b.jsxs)("div",{className:"p-8 text-red-600",children:["Error: ",e.message]}):(0,b.jsxs)("div",{className:"p-8 max-w-7xl mx-auto",children:[(0,b.jsxs)("div",{className:"flex justify-between items-center mb-8",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h1",{className:"text-3xl font-serif font-bold text-[bg-desert-text]",children:"Guest History (CRM)"}),(0,b.jsx)("p",{className:"text-stone-500 text-sm mt-1",children:"View all your past and current customers"})]}),(0,b.jsxs)("div",{className:"bg-[bg-desert-text] text-[text-desert-text] px-6 py-2 rounded-sm font-bold",children:["Total Customers: ",a?.length||0]})]}),(0,b.jsx)("div",{className:"bg-white border border-stone-200 shadow-sm overflow-x-auto",children:(0,b.jsxs)("table",{className:"w-full text-left text-sm text-stone-600",children:[(0,b.jsx)("thead",{className:"bg-[#faf8f5] border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500",children:(0,b.jsxs)("tr",{children:[(0,b.jsx)("th",{className:"px-6 py-4 font-bold",children:"Guest Name"}),(0,b.jsx)("th",{className:"px-6 py-4 font-bold",children:"Contact Info"}),(0,b.jsx)("th",{className:"px-6 py-4 font-bold text-center",children:"Total Stays"}),(0,b.jsx)("th",{className:"px-6 py-4 font-bold text-right",children:"Total Spent"}),(0,b.jsx)("th",{className:"px-6 py-4 font-bold text-right",children:"Last Visit"})]})}),(0,b.jsx)("tbody",{className:"divide-y divide-stone-100",children:a?.map(a=>{let c=a.bookings?.filter(a=>"cancelled"!==a.status)||[],e=c.reduce((a,b)=>a+Number(b.total_amount),0),f=c.length>0?c.sort((a,b)=>new Date(b.check_in).getTime()-new Date(a.check_in).getTime())[0].check_in:null;return(0,b.jsxs)("tr",{className:"hover:bg-stone-50/50",children:[(0,b.jsx)("td",{className:"px-6 py-4 font-bold text-[bg-desert-text]",children:a.full_name}),(0,b.jsxs)("td",{className:"px-6 py-4",children:[(0,b.jsx)("p",{className:"text-xs text-stone-600 font-medium",children:a.phone}),(0,b.jsx)("p",{className:"text-xs text-stone-400",children:a.email||"No email"})]}),(0,b.jsx)("td",{className:"px-6 py-4 text-center",children:(0,b.jsx)("span",{className:"bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-xs font-bold border border-stone-200",children:c.length})}),(0,b.jsx)("td",{className:"px-6 py-4 text-right font-bold text-[text-desert-text]",children:(0,d.f)(e)}),(0,b.jsx)("td",{className:"px-6 py-4 text-right text-xs",children:f?new Date(f).toLocaleDateString("en-IN"):"-"})]},a.id)})})]})})]})}a.s(["default",0,e])},12082,function(a){a.n(a.i(85888))}];

//# sourceMappingURL=app_admin_guests_page_tsx_1qzsop8k7p_bp._.js.map