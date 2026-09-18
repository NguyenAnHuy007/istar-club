"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#050506" />
    </svg>
  );
}

const footerLinks = [
  {
    title: "Liên kết",
    links: [
      { label: "Trang chủ", href: "/" },
      { label: "Giới thiệu", href: "/#about" },
      { label: "Các ban", href: "/#departments" },
      { label: "Thành tích", href: "/#achievements" },
    ],
  },
  {
    title: "Hoạt động",
    links: [
      { label: "Mini Show", href: "/#about" },
      { label: "Quay MV", href: "/#about" },
      { label: "Ứng tuyển thành viên", href: "/apply" },
      { label: "Các cuộc thi", href: "/#about" },
    ],
  },
];

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer id="footer" className="relative pt-12 px-6">
      {/* Top gradient divider */}
      <div className="section-divider w-full max-w-7xl mx-auto mb-10 md:mb-14" />

      <div ref={ref} className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 28, rotateX: 3 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ perspective: "800px", transformOrigin: "center top" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-8 pb-8 md:pb-14"
        >
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(37,87,152,0.35)] shrink-0">
                <Image
                  src="/logo.png"
                  alt="iStar Club Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-semibold tracking-tight text-[#EDEDEF]">
                iStar
              </span>
            </div>
            <p className="text-sm text-[#8A8F98] leading-relaxed mb-6 max-w-xs">
              Câu lạc bộ Nghệ thuật iStar — Trường CNTT&TT, Đại học Công nghiệp
              Hà Nội. Keep your passion and shine together.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/iStarHaUI"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-[#8A8F98] hover:text-[#EDEDEF] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@istarhaui"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-[#8A8F98] hover:text-[#EDEDEF] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-[#EDEDEF] mb-4 tracking-tight">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#8A8F98] hover:text-[#EDEDEF] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div>
            <h4 className="text-sm font-semibold text-[#EDEDEF] mb-4 tracking-tight">
              Liên hệ
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-[#8A8F98]">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-[#255798]" />
                <span className="break-words">
                  Số 298 Đ. Cầu Diễn, Nhổn, Tây Tựu, Hà Nội
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#8A8F98]">
                <Mail className="w-4 h-4 shrink-0 text-[#255798]" />
                <a href="mailto:istarhaui@gmail.com" className="hover:text-[#EDEDEF] transition-colors duration-200">
                  istarhaui@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-[#8A8F98]">
                <Phone className="w-4 h-4 shrink-0 text-[#255798]" />
                <a href="tel:+84854887015" className="hover:text-[#EDEDEF] transition-colors duration-200">
                  085 488 7015
                </a>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] py-5 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs text-[#8A8F98]/60">
            © 2026 iStar - Câu lạc bộ Nghệ thuật. All rights reserved.
          </p>
          <p className="text-xs text-[#8A8F98]/40">
            Made by Nguyen An Huy
          </p>
        </div>
      </div>
    </footer>
  );
}
