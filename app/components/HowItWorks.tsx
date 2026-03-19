const steps = [
  {
    number: "01",
    title: "Text your intent",
    description:
      "Send a message to Done. about anything you've been putting off. No matter how messy or vague.",
  },
  {
    number: "02",
    title: "Get a plan",
    description:
      "The agent instantly breaks it down into steps and suggests the very first action you can take right now.",
  },
  {
    number: "03",
    title: "Stay on track",
    description:
      "Done. follows up, nudges you, and helps you complete each step until the task is officially finished.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-8">
              How it works
            </h2>
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6">
                  <span className="text-4xl font-mono font-bold text-slate-200">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-slate-100 rounded-[3rem] overflow-hidden border border-slate-200 flex items-center justify-center p-12">
              <div className="space-y-4 w-full">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 max-w-[80%] ml-auto">
                  <p className="text-sm text-slate-800">
                    &quot;I need to organize my taxes but I&apos;m
                    overwhelmed.&quot;
                  </p>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl shadow-lg max-w-[80%]">
                  <p className="text-sm text-white">
                    &quot;I hear you. Let&apos;s start small. Step 1: Just find
                    your W2s. I&apos;ll check back in 15 mins to see if
                    you&apos;ve found them.&quot;
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 max-w-[80%] ml-auto">
                  <p className="text-sm text-slate-800">
                    &quot;Found them.&quot;
                  </p>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl shadow-lg max-w-[80%]">
                  <p className="text-sm text-white">
                    &quot;Great! Now let&apos;s put them in one folder. Step 2:
                    Download your bank statements...&quot;
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
