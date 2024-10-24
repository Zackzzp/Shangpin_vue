import request from '@/utils/request'
const api_name = '/admin/system/sysMenu'

// 分页列表
export const FindNodes = () => {
  return request({
    url: `${api_name}/findNodes`,
    method: 'get',
  })
}

// 保存信息
export const SaveMenu = sysMenu => {
  return request({
    url: `${api_name}/save`,
    method: 'post',
    data: sysMenu,
  })
}
