import Request from '@/utils/request'
import request from '@/utils/request'
import { data } from 'autoprefixer'

export const GetSysRoleListByPage = (pageNum, pageSize, queryDto) => {
  return request({
    url: '/admin/system/sysRole/findByPage/' + pageNum + '/' + pageSize,
    method: 'get',
    params: queryDto.value,
  })
}

export const SaveSysRole = data => {
  return request({
    url: '/admin/system/sysRole/saveSysRole',
    method: 'POST',
    data: data,
  })
}

export const UpdateSysRole = data => {
  return request({
    url: '/admin/system/sysRole/updateSysRole',
    method: 'put',
    data: data,
  })
}

// 删除角色
export const DeleteSysRoleById = roleId => {
  return request({
    url: '/admin/system/sysRole/deleteById/' + roleId,
    method: 'delete',
  })
}

// 查询指定角色所对应的菜单id
export const GetSysRoleMenuIds = roleId => {
  return request({
    url: '/admin/system/sysRoleMenu/findSysRoleMenuByRoleId/' + roleId,
    method: 'get',
  })
}

// 根据角色分配菜单请求方法
export const DoAssignMenuIdToSysRole = assignMenuDto => {
  return request({
    url: '/admin/system/sysRoleMenu/doAssign',
    method: 'post',
    data: assignMenuDto,
  })
}
