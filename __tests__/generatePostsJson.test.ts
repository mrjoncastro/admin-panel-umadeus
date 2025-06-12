import { describe, it, expect, vi, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import vm from 'vm'

// util para executar o script com mocks
function runScript(context: Record<string, any>) {
  const code = fs.readFileSync(path.join(__dirname, '../scripts/generatePostsJson.js'), 'utf-8')
  vm.runInNewContext(code, { ...context, console, process })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('generatePostsJson script', () => {
  it('cria posts.json com campos esperados', () => {
    const writeFileSync = vi.fn()
    const mockFs = {
      readdirSync: vi.fn(() => ['hello.mdx', 'world.mdx']),
      readFileSync: vi.fn((p: string) => (p.includes('hello') ? 'hello' : 'world')),
      existsSync: vi.fn(() => false),
      mkdirSync: vi.fn(),
      unlinkSync: vi.fn(),
      writeFileSync,
    }
    const mockPath = {
      join: (...parts: string[]) => parts.join('/'),
      basename: (p: string) => p.split('/').pop() || '',
    }
    const matter = vi.fn((content: string) => {
      if (content === 'hello') {
        return { data: { title: 'Hello', summary: 'sum', date: '2024-05-05', thumbnail: 'thumb.png', category: 'Test', keywords: 'foo, bar' } }
      }
      if (content === 'world') {
        return { data: { title: 'World', date: '2025-01-01', headerImage: 'img2.png', keywords: ['a', 'b'] } }
      }
      return { data: {} }
    })

    runScript({ require: (id: string) => {
      if (id === 'fs') return mockFs
      if (id === 'path') return mockPath
      if (id === 'gray-matter') return matter
      return require(id)
    }})

    expect(writeFileSync).toHaveBeenCalledTimes(1)
    const json = JSON.parse(writeFileSync.mock.calls[0][1])
    expect(json).toEqual([
      {
        title: 'World',
        slug: 'world',
        summary: '',
        date: '2025-01-01',
        thumbnail: '/uploads/img2.png',
        category: null,
        keywords: ['a', 'b']
      },
      {
        title: 'Hello',
        slug: 'hello',
        summary: 'sum',
        date: '2024-05-05',
        thumbnail: '/uploads/thumb.png',
        category: 'Test',
        keywords: ['foo', 'bar']
      }
    ])
  })

  it('trata erro de caminho inválido', () => {
    const error = new Error('fail')
    const mockFs = {
      readdirSync: vi.fn(() => { throw error }),
      readFileSync: vi.fn(),
      existsSync: vi.fn(),
      mkdirSync: vi.fn(),
      unlinkSync: vi.fn(),
      writeFileSync: vi.fn(),
    }
    const mockPath = {
      join: (...parts: string[]) => parts.join('/'),
      basename: (p: string) => p.split('/').pop() || '',
    }
    const matter = vi.fn()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    runScript({ require: (id: string) => {
      if (id === 'fs') return mockFs
      if (id === 'path') return mockPath
      if (id === 'gray-matter') return matter
      return require(id)
    }})

    expect(consoleError).toHaveBeenCalledWith('❌ Erro ao gerar posts.json:', error)
  })
})

