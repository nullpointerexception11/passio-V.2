/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, PenTool, Clock, FileText, ChevronRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { ReadingTimeService, formatReadingDuration } from '../../core/time/ReadingTimeService';
import { WritingTimeService, formatWritingDuration } from '../../core/time/WritingTimeService';
import { AccessTrackingService, IAccessRecord } from '../../core/access/AccessTrackingService';
import { SAMPLE_PDF_DOCUMENTS, ISamplePdfDoc } from '../../data/samplePdfs';
import { NotebookService } from '../../core/notebooks/NotebookService';
import { INotebook } from '../../core/notebooks/NotebookModel';
import { NavigationService } from '../../core/knowledge/NavigationService';

export const DailyDeskScreen: React.FC = () => {
  const navigate = useNavigate();
  const { themeType, toggleTheme } = useTheme();

  // Stats State
  const [readingStats, setReadingStats] = useState(() => ReadingTimeService.getStats());
  const [writingSeconds, setWritingSeconds] = useState<number>(
    () => WritingTimeService.getStats().todaySeconds
  );

  // Material & Notebook State
  const [lastPdf, setLastPdf] = useState<ISamplePdfDoc | null>(null);
  const [lastNotebook, setLastNotebook] = useState<INotebook | null>(null);
  const [recentMaterials, setRecentMaterials] = useState<IAccessRecord[]>([]);

  useEffect(() => {
    // 1. Subscribe to Reading & Writing times
    const unsubReading = ReadingTimeService.subscribe((stats) => {
      setReadingStats(stats);
    });
    const unsubWriting = WritingTimeService.subscribe((stats) => {
      setWritingSeconds(stats.todaySeconds);
    });

    // 2. Fetch Last Reading Material
    const recentRecords = AccessTrackingService.getFrequentlyAccessed(10);
    setRecentMaterials(recentRecords.slice(0, 5));

    const pdfRecord = recentRecords.find((r) => r.type === 'pdf');
    if (pdfRecord) {
      const doc = SAMPLE_PDF_DOCUMENTS.find((d) => d.id === pdfRecord.id);
      setLastPdf(doc || SAMPLE_PDF_DOCUMENTS[0]);
    } else {
      setLastPdf(SAMPLE_PDF_DOCUMENTS[0]);
    }

    // 3. Fetch Last Writing Notebook
    async function loadLastNotebook() {
      const notebooks = await NotebookService.getNotebooks();
      if (notebooks.length > 0) {
        const lastId = localStorage.getItem('passio_last_active_notebook_id');
        const matched = notebooks.find((nb) => nb.metadata.id === lastId);
        setLastNotebook(matched || notebooks[0]);
      }
    }
    loadLastNotebook();

    return () => {
      unsubReading();
      unsubWriting();
    };
  }, []);

  // Handlers
  const handleContinueReading = () => {
    if (lastPdf) {
      NavigationService.navigateToSource(navigate, lastPdf.id, 1);
    } else {
      navigate('/library');
    }
  };

  const handleContinueWriting = () => {
    if (lastNotebook) {
      navigate('/focus', { state: { notebookId: lastNotebook.metadata.id } });
    } else {
      navigate('/focus');
    }
  };

  const handleOpenMaterial = (record: IAccessRecord) => {
    if (record.type === 'pdf') {
      NavigationService.navigateToSource(navigate, record.id, 1);
    } else if (record.type === 'notebook') {
      navigate('/focus', { state: { notebookId: record.id } });
    } else {
      navigate('/library');
    }
  };

  return (
    <div
      id="passio-daily-desk-root"
      className="min-h-screen w-screen flex flex-col select-none overflow-x-hidden"
      style={{
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Navigation Header */}
      <header
        className="h-14 px-6 sm:px-10 border-b flex items-center justify-between shrink-0"
        style={{
          borderColor: 'var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg-surface)',
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer opacity-80 hover:opacity-100"
            style={{ borderColor: 'var(--color-border-subtle)' }}
            title="Ana Salona Dön"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Salona Dön</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif font-semibold tracking-widest uppercase opacity-60">
              GÜNÜN MASASI
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/10">
              Daily Desk
            </span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-xl border cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 opacity-70 transition-colors"
          style={{ borderColor: 'var(--color-border-subtle)' }}
          title="Temayı Değiştir"
        >
          {themeType === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Content Area: Max 5 Sections, No Widgets, No Chart Clutter */}
      <main className="flex-1 overflow-y-auto px-6 py-10 sm:px-12 md:px-20 flex justify-center items-start">
        <div className="w-full max-w-3xl flex flex-col gap-10">
          
          {/* Header Title & Subtitle */}
          <div className="flex flex-col gap-1 border-b pb-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
            <h1 className="text-xl sm:text-2xl font-serif font-semibold tracking-wide">
              Günün Çalışma Masası
            </h1>
            <p className="text-xs font-mono opacity-50">
              Sessiz okuma seansları, yazılar ve günün odak metrikleri.
            </p>
          </div>

          {/* Section 1 & Section 2: Continue Reading & Continue Writing Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. SECTION: Continue Reading */}
            <section
              className="p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all hover:border-amber-500/40"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400 font-medium">
                  <BookOpen className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Okumaya Devam Et</span>
                </div>
                {lastPdf ? (
                  <div className="flex flex-col gap-0.5 mt-1">
                    <h3 className="font-serif font-semibold text-sm line-clamp-1">
                      {lastPdf.title}
                    </h3>
                    <p className="text-xs font-mono opacity-50 line-clamp-1">
                      {lastPdf.author} • {lastPdf.pageCount} Sayfa
                    </p>
                  </div>
                ) : (
                  <p className="text-xs font-mono opacity-50 mt-1">Henüz okunan eser bulunmuyor.</p>
                )}
              </div>

              <button
                onClick={handleContinueReading}
                className="self-start mt-2 px-4 py-2 rounded-xl text-xs font-mono font-medium bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>Okumaya Başla</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </section>

            {/* 2. SECTION: Continue Writing */}
            <section
              className="p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all hover:border-amber-500/40"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400 font-medium">
                  <PenTool className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Yazmaya Devam Et</span>
                </div>
                {lastNotebook ? (
                  <div className="flex flex-col gap-0.5 mt-1">
                    <h3 className="font-serif font-semibold text-sm line-clamp-1">
                      {lastNotebook.metadata.title}
                    </h3>
                    <p className="text-xs font-mono opacity-50 line-clamp-1">
                      Defter • {lastNotebook.metadata.wordCount} Kelime
                    </p>
                  </div>
                ) : (
                  <p className="text-xs font-mono opacity-50 mt-1">Henüz aktif defter bulunmuyor.</p>
                )}
              </div>

              <button
                onClick={handleContinueWriting}
                className="self-start mt-2 px-4 py-2 rounded-xl text-xs font-mono font-medium border border-amber-500/30 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <span>Yazmaya Başla</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </section>
          </div>

          {/* Section 3 & Section 4: Today's Reading Time & Today's Writing Time (Quiet Typographic Metrics) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 3. SECTION: Reading Time Totals (Daily & Weekly) */}
            <section
              className="p-5 rounded-2xl border flex flex-col gap-2"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div className="flex items-center gap-2 text-xs font-mono opacity-60">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="uppercase tracking-wider">Okuma Süresi (Toplamlar)</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex flex-col">
                  <span className="text-2xl font-serif font-semibold text-amber-600 dark:text-amber-400">
                    {formatReadingDuration(readingStats.todaySeconds)}
                  </span>
                  <span className="text-[10px] font-mono opacity-50 uppercase tracking-wider">Bugün</span>
                </div>
                <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                <div className="flex flex-col text-right">
                  <span className="text-2xl font-serif font-semibold text-amber-600 dark:text-amber-400">
                    {formatReadingDuration(readingStats.thisWeekSeconds)}
                  </span>
                  <span className="text-[10px] font-mono opacity-50 uppercase tracking-wider">Bu Hafta</span>
                </div>
              </div>

              {/* Subtle Progress Bar */}
              <div className="mt-4 pt-4 border-t flex flex-col gap-2" style={{ borderColor: 'var(--color-border-subtle)' }}>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 opacity-60">
                    <span>Günlük Hedef:</span>
                    <select
                      value={readingStats.dailyGoalSeconds}
                      onChange={(e) => {
                        const seconds = parseInt(e.target.value, 10);
                        ReadingTimeService.setDailyGoal(seconds);
                      }}
                      className="bg-transparent border-none text-[11px] font-mono text-amber-600 dark:text-amber-400 focus:outline-none font-medium cursor-pointer p-0 underline decoration-dotted underline-offset-2 hover:opacity-100 transition-opacity"
                    >
                      <option value="300" className="bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200">5 dk</option>
                      <option value="600" className="bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200">10 dk</option>
                      <option value="900" className="bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200">15 dk</option>
                      <option value="1200" className="bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200">20 dk</option>
                      <option value="1800" className="bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200">30 dk</option>
                      <option value="2700" className="bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200">45 dk</option>
                      <option value="3600" className="bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200">60 dk</option>
                      <option value="5400" className="bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200">90 dk</option>
                      <option value="7200" className="bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200">120 dk</option>
                    </select>
                  </div>
                  <span className="opacity-60">
                    %{Math.min(100, Math.round((readingStats.todaySeconds / readingStats.dailyGoalSeconds) * 100))}
                  </span>
                </div>
                
                <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500/70 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, (readingStats.todaySeconds / readingStats.dailyGoalSeconds) * 100)}%` }}
                  />
                </div>
              </div>
            </section>

            {/* 4. SECTION: Today's Writing Time */}
            <section
              className="p-5 rounded-2xl border flex flex-col gap-2"
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div className="flex items-center gap-2 text-xs font-mono opacity-60">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="uppercase tracking-wider">Bugünkü Yazma Süresi</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-serif font-semibold text-amber-600 dark:text-amber-400">
                  {formatWritingDuration(writingSeconds)}
                </span>
                <span className="text-[11px] font-mono opacity-40">
                  {writingSeconds > 0 ? 'Aktif yazma seansı' : 'Henüz yazma yapılmadı'}
                </span>
              </div>
            </section>
          </div>

          {/* 5. SECTION: Recent Materials */}
          <section
            className="p-6 rounded-2xl border flex flex-col gap-4"
            style={{
              backgroundColor: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--color-border-subtle)' }}>
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-amber-600 dark:text-amber-400">
                <FileText className="w-4 h-4" />
                <span className="uppercase tracking-wider">Son Materyaller</span>
              </div>
              <span className="text-[10px] font-mono opacity-40">Kişisel Erişim Geçmişi</span>
            </div>

            {recentMaterials.length === 0 ? (
              <p className="text-xs font-mono opacity-50 py-4 text-center">
                Henüz açılmış materyal bulunmuyor.
              </p>
            ) : (
              <div className="flex flex-col divide-y" style={{ borderColor: 'var(--color-border-subtle)' }}>
                {recentMaterials.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenMaterial(item)}
                    className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-amber-500 shrink-0">
                        {item.type === 'pdf' ? (
                          <BookOpen className="w-3.5 h-3.5" />
                        ) : (
                          <PenTool className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-serif font-medium truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="text-[10px] font-mono opacity-40 truncate">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 text-amber-500" />
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
};

export default DailyDeskScreen;
