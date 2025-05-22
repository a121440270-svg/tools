export const useUser = () => {
  return useState('user', () => ({
    id: null,
    name: '',
    email: '',
    avatar: ''
  }))
}