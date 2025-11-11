'use client'

import { ChangeEvent, useState } from 'react'
import { IshinDenshinConfig } from '../../types/ishindenshin'
import { usePresignedUpload } from 'next-s3-upload'

type Props = {
  sessionId: string
  config: IshinDenshinConfig
  onSubmit: (sessionId: string, config: IshinDenshinConfig) => void
}

export const ConfigForm: React.FC<Props> = ({
  sessionId,
  config,
  onSubmit,
}) => {
  const [filled, setFilled] = useState<boolean>(false)
  const [groomName, setGroomName] = useState<string>(
    config.participants?.groomName
  )
  const [brideName, setBrideName] = useState<string>(
    config.participants?.brideName
  )
  const [standbyScreenUrl, setStandbyScreenUrl] = useState<string | undefined>(
    config.standbyScreenUrl
  )
  const { uploadToS3 } = usePresignedUpload()
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const { url } = await uploadToS3(event.target.files[0])
      setStandbyScreenUrl(url.replace('/v1/s3', '/v1/object/public'))
      setFilled(true)
    }
  }
  return (
    <form className="flex flex-col gap-1">
      <label>待機画面</label>
      {standbyScreenUrl && (
        <img src={standbyScreenUrl} className="w-80" alt="thumbnail" />
      )}
      <input
        type="file"
        onChange={handleFileChange}
        className="file-input w-full max-w-xs"
      />
      <label>新郎</label>
      <input
        className="input-bordered input w-full"
        value={groomName}
        type="text"
        onChange={(e) => {
          setGroomName(e.target.value)
          setFilled(true)
        }}
      />
      <label>新婦</label>
      <input
        className="input-bordered input w-full"
        value={brideName}
        type="text"
        onChange={(e) => {
          setBrideName(e.target.value)
          setFilled(true)
        }}
      />
      <button
        type="button"
        className="btn"
        disabled={!filled}
        onClick={() => {
          Promise.resolve(
            onSubmit(sessionId, {
              participants: { groomName, brideName },
              standbyScreenUrl,
            })
          ).catch((error) => console.error(error))
          setFilled(false)
        }}
      >
        保存
      </button>
    </form>
  )
}
