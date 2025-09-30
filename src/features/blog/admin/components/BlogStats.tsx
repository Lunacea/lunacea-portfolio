'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Eye, FileText, TrendingUp, Heart, Clock, MessageSquare, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Area, AreaChart, Legend } from 'recharts';
import { adminDeleteComment, replyToComment } from '@/features/blog/admin/actions/commentActions';
import type { BlogStats, ViewsTrendPoint, LikeTrendPoint, RankedPost, RecentCommentItem } from '@/features/blog/admin/actions/statsActions';
import type { AnalyticsEventSummary } from '@/features/blog/admin/actions/analyticsActions';

export default function BlogStats({ initialStats, initialViewsTrend, initialLikeTrend, initialPopularPosts, initialRecentComments, initialAnalytics }: {
  initialStats: BlogStats;
  initialViewsTrend: ViewsTrendPoint[];
  initialLikeTrend: LikeTrendPoint[];
  initialPopularPosts: RankedPost[];
  initialRecentComments: RecentCommentItem[];
  initialAnalytics: AnalyticsEventSummary;
}) {
  const stats = initialStats;
  const viewsTrend = initialViewsTrend;
  const likeTrend = initialLikeTrend;
  const popular = initialPopularPosts;
  const recentComments = initialRecentComments;
  const analytics = initialAnalytics;

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* 基本統計 - 4カラムグリッド */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総記事数</CardTitle>
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPosts}</div>
            <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                公開: {stats.publishedPosts}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                下書き: {stats.draftPosts}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総閲覧数</CardTitle>
            <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalPosts > 0 ? `平均 ${Math.round(stats.totalViews / stats.totalPosts).toLocaleString()} 回/記事` : '記事なし'}
            </p>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均読了時間</CardTitle>
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageReadingTime}</div>
            <p className="text-xs text-muted-foreground mt-1">分</p>
          </CardContent>
        </Card>

        <Card className="border bg-gradient-to-br from-pink-50 to-transparent dark:from-pink-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総バージョン</CardTitle>
            <BarChart3 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalVersions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalPosts > 0 ? `平均 ${(stats.totalVersions / stats.totalPosts).toFixed(1)} 版/記事` : '記事なし'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 閲覧推移＆いいね推移 - 改善されたグラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border bg-transparent shadow-lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" /> 
              閲覧数の推移（直近30日）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={viewsTrend}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#e5e7eb" 
                    className="dark:stroke-gray-700"
                  />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    stroke="#6b7280"
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    name="日次閲覧数"
                    stroke="#6366F1" 
                    strokeWidth={2}
                    fill="url(#colorViews)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cumulative" 
                    name="累積閲覧数"
                    stroke="#0EA5E9" 
                    strokeWidth={2}
                    fill="url(#colorCumulative)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border bg-transparent shadow-lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-600" /> 
              いいねの推移（直近30日）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={likeTrend}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#e5e7eb"
                    className="dark:stroke-gray-700"
                  />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickMargin={8}
                    stroke="#6b7280"
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    cursor={{ fill: 'rgba(244, 63, 94, 0.1)' }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="likes" 
                    name="いいね数"
                    fill="url(#colorLikes)" 
                    radius={[8, 8, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 人気記事ランキング */}
      <Card className="border bg-transparent shadow-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" /> 
            人気記事ランキング TOP10
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {popular.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>公開記事がありません</p>
              </div>
            ) : (
              popular.map((p, idx) => (
                <div 
                  key={p.id} 
                  className="flex items-center justify-between p-4 border rounded-xl bg-gradient-to-r from-transparent to-transparent hover:from-amber-50 hover:to-transparent dark:hover:from-amber-950/20 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm
                      ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                        idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                        idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}
                    `}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm truncate group-hover:text-amber-600 transition-colors">
                        {p.title}
                      </h4>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {p.viewCount.toLocaleString()} 閲覧
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {p.likes} いいね
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="ml-4" asChild>
                    <Link href={`/dashboard/blog/edit/${p.slug}`}>編集</Link>
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 最近のコメント（削除/返信） */}
      <Card className="border bg-transparent shadow-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            最近のコメント
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentComments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>コメントがありません</p>
              </div>
            ) : (
              recentComments.map((c) => (
                <CommentRow key={c.id} item={c} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Events サマリー */}
      <Card className="border bg-transparent shadow-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            アナリティクス（過去30日）
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.totalEvents === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>アナリティクスデータがありません</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* サマリーカード */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 border rounded-xl bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-950/20">
                  <div className="text-xs text-muted-foreground mb-1">総イベント</div>
                  <div className="text-2xl font-bold">{analytics.totalEvents.toLocaleString()}</div>
                </div>
                <div className="p-4 border rounded-xl bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
                  <div className="text-xs text-muted-foreground mb-1">ユニークパス</div>
                  <div className="text-2xl font-bold">{analytics.uniquePaths}</div>
                </div>
                <div className="p-4 border rounded-xl bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/20">
                  <div className="text-xs text-muted-foreground mb-1">平均滞在</div>
                  <div className="text-2xl font-bold">{analytics.avgDuration}秒</div>
                </div>
              </div>

              {/* イベントタイプ別 */}
              {analytics.eventsByType.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    イベントタイプ別
                  </h4>
                  <div className="space-y-2">
                    {analytics.eventsByType.map((event) => (
                      <div key={event.eventType} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm font-medium">{event.eventType}</span>
                        <span className="text-sm text-muted-foreground">{event.count.toLocaleString()} 回</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* トップパス */}
              {analytics.topPaths.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    トップアクセスパス
                  </h4>
                  <div className="space-y-2">
                    {analytics.topPaths.slice(0, 5).map((path) => (
                      <div key={path.path} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{path.path}</div>
                          {path.avgDuration && (
                            <div className="text-xs text-muted-foreground">
                              平均滞在: {path.avgDuration}秒
                            </div>
                          )}
                        </div>
                        <span className="ml-4 text-sm font-semibold text-emerald-600">
                          {path.count.toLocaleString()} 回
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CommentRow({ item }: { item: RecentCommentItem }) {
  const onDelete = async () => {
    // eslint-disable-next-line no-alert
    if (!confirm('このコメントを削除してもよろしいですか？')) return;
    await adminDeleteComment(item.id);
    // ページ更新で反映
    window.location.reload();
  };
  
  const onReply = async () => {
    const textarea = document.createElement('textarea');
    textarea.placeholder = '返信内容を入力してください...';
    textarea.className = 'w-full p-3 border rounded-lg min-h-[100px] font-sans';
    const wrap = document.createElement('div');
    wrap.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    const modal = document.createElement('div');
    modal.className = 'bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl';
    const title = document.createElement('h3');
    title.textContent = 'コメントに返信';
    title.className = 'text-lg font-bold mb-4';
    modal.appendChild(title);
    modal.appendChild(textarea);
    
    const text = await new Promise<string | null>((resolve) => {
      const btnContainer = document.createElement('div');
      btnContainer.className = 'flex gap-2 mt-4 justify-end';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'キャンセル';
      cancelBtn.className = 'px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors';
      cancelBtn.onclick = () => { resolve(null); cleanup(); };
      
      const okBtn = document.createElement('button');
      okBtn.textContent = '返信する';
      okBtn.className = 'px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors';
      okBtn.onclick = () => { resolve(textarea.value.trim() || null); cleanup(); };
      
      btnContainer.appendChild(cancelBtn);
      btnContainer.appendChild(okBtn);
      modal.appendChild(btnContainer);
      wrap.appendChild(modal);
      document.body.appendChild(wrap);
      
      textarea.focus();
      
      function cleanup() {
        document.body.removeChild(wrap);
      }
    });
    
    if (!text) return;
    await replyToComment(item.id, item.slug, text);
    window.location.reload();
  };
  
  return (
    <div className="flex items-start justify-between p-4 border rounded-xl bg-gradient-to-r from-transparent to-transparent hover:from-blue-50 hover:to-transparent dark:hover:from-blue-950/20 transition-all duration-200 group">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium">{item.author}</span>
          <span className="text-xs text-muted-foreground">・</span>
          <span className="text-xs text-muted-foreground">{item.slug}</span>
          <span className="text-xs text-muted-foreground">・</span>
          <span className="text-xs text-muted-foreground">
            {new Date(item.createdAt).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <div className="text-sm break-words bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
          {item.body}
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <Button size="sm" variant="outline" onClick={onReply} className="group-hover:border-blue-600 transition-colors">
          返信
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          削除
        </Button>
      </div>
    </div>
  );
}
