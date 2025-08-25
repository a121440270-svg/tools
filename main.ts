```typescript
import { ID_INJECTION_KEY } from 'element-plus'

app.provide(ID_INJECTION_KEY, {
  prefix: Math.random().toString(36).substr(2, 10),
  current: 0
})
```