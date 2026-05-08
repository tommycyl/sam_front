<template>
  <div class="bg-background p-container-padding">
    <div class="mb-6">
      <h2 class="text-display-lg font-display-lg text-on-background mb-1">系统设置</h2>
      <p class="text-body-sm text-on-surface-variant">配置基础信息、通知偏好与权限。</p>
    </div>

    <div class="grid grid-cols-1 gap-grid-gutter lg:grid-cols-3">
      <section
        v-for="card in cards"
        :key="card.title"
        class="rounded-xl border border-surface-variant bg-surface-container-lowest p-5 shadow-sm"
      >
        <div class="mb-4 flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed/40 text-primary"
          >
            <span class="material-symbols-outlined">{{ card.icon }}</span>
          </div>
          <h3 class="text-headline-md font-headline-md text-primary">{{ card.title }}</h3>
        </div>
        <p class="mb-4 text-body-sm text-on-surface-variant">{{ card.desc }}</p>
        <button
          type="button"
          class="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-body-sm font-semibold text-primary transition-colors hover:bg-surface-container-low"
        >
          前往配置
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
const cards = [
  { title: '账号资料', desc: '维护管理员资料、登录邮箱、安全密钥。', icon: 'person' },
  { title: '通知偏好', desc: '邮件、站内信和移动端通知规则。', icon: 'notifications' },
  { title: '团队成员', desc: '管理 PM/Mentor/老师角色与权限分配。', icon: 'groups' },
  { title: '集成', desc: '连接日历、邮件与第三方服务。', icon: 'integration_instructions' },
  { title: '工作流', desc: '自定义任务模板与默认时间窗。', icon: 'schedule' },
  { title: '安全', desc: '登录设备、双因素认证及会话管理。', icon: 'shield' },
]
</script>
